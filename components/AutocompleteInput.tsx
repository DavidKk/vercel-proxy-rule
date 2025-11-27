'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface BundleIdOption {
  bundleId: string
  name: string
  category?: string
}

interface AutocompleteInputProps {
  ruleId: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export default function AutocompleteInput(props: AutocompleteInputProps) {
  const { ruleId, value, onChange, placeholder = 'Search Bundle ID...', className = '', required = false } = props
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<BundleIdOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 当外部 value 改变时更新内部 query（但不在输入过程中）
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setQuery(value)
    }
  }, [value])

  // 搜索 Bundle ID
  const searchBundleId = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setOptions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/iosbundleidfinder?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error('Failed to search')
      }
      const data = await response.json()
      const results: BundleIdOption[] = data.results || []
      setOptions(results)
      setIsOpen(results.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error searching bundle ID:', error)
      setOptions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 防抖搜索
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value
      setQuery(newQuery)
      onChange(newQuery)

      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // 设置新的防抖定时器
      debounceTimerRef.current = setTimeout(() => {
        searchBundleId(newQuery)
      }, 300) // 300ms 防抖
    },
    [onChange, searchBundleId]
  )

  // 选择选项
  const handleSelect = useCallback(
    (option: BundleIdOption) => {
      setQuery(option.bundleId)
      onChange(option.bundleId)
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.focus()
    },
    [onChange]
  )

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || options.length === 0) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < options.length) {
            handleSelect(options[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    },
    [isOpen, options, selectedIndex, handleSelect]
  )

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) && listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 滚动到选中的项
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative flex-grow">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (options.length > 0) {
            setIsOpen(true)
          }
        }}
        placeholder={placeholder}
        className={`h-8 text-sm border rounded-sm box-border px-3 w-full ${className}`}
        required={required}
        data-id={ruleId}
        autoComplete="off"
      />

      {isOpen && (
        <ul ref={listRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-auto" role="listbox">
          {isLoading && (
            <li className="px-3 py-2 text-sm text-gray-500" role="option">
              搜索中...
            </li>
          )}
          {!isLoading && options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500" role="option">
              未找到结果
            </li>
          )}
          {!isLoading &&
            options.map((option, index) => (
              <li
                key={`${option.bundleId}-${index}`}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${index === selectedIndex ? 'bg-blue-100' : ''}`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="font-medium">{option.name}</div>
                <div className="text-xs text-gray-500">{option.bundleId}</div>
                {option.category && <div className="text-xs text-gray-400">{option.category}</div>}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
