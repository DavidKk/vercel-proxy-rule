'use client'

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BarsArrowUpIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useRequest } from 'ahooks'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { putClashRules } from '@/app/api/clash/rule'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import ClearableSelect from '@/components/ClearableSelect'
import { Spinner } from '@/components/Spinner'
import { type ClashRuleType, isValidClashRule, STANDARD_RULE_TYPES } from '@/services/clash/types'
import { guid } from '@/utils/guid'

import { FilterBar } from './FilterBar'
import SortableItem from './SortableItem'
import type { ClashRule } from './types'

export interface RuleManagerProps {
  rules: ClashRule[]
  actions: string[]
}

// 将 ControlledInput 移到组件外部，避免每次渲染时重新创建
const ControlledInput = React.memo(
  ({ ruleId, value, onChange }: { ruleId: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
    return <input type="text" value={value} onChange={onChange} placeholder="Value" className="flex-grow h-8 text-sm border rounded-sm box-border px-3" required data-id={ruleId} />
  },
  (prevProps, nextProps) => {
    // 只在 ruleId 或 value 改变时重新渲染
    // onChange 应该是稳定的函数，不会导致重新渲染
    return prevProps.ruleId === nextProps.ruleId && prevProps.value === nextProps.value && prevProps.onChange === nextProps.onChange
  }
)
ControlledInput.displayName = 'ControlledInput'

export default function RuleManager(props: RuleManagerProps) {
  const { rules: defaultRules, actions } = props
  const [rules, setRules] = useState([...defaultRules])
  const [filteredRules, setFilteredRules] = useState(rules)
  const alertRef = useRef<AlertImperativeHandler>(null)
  const focusNextRef = useRef<string>(null)
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))
  const formRef = useRef<HTMLFormElement>(null)
  const virtuosoRef = useRef<any>(null)
  const filterBarRef = useRef<{ clearFilters: () => void; getFilters: () => { typeFilter: string; actionFilter: string; valueFilter: string } } | null>(null)

  const isFilterMode = filteredRules.length !== rules.length

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setRules((prevRules) =>
        arrayMove(
          prevRules,
          prevRules.findIndex((rule) => rule.id === active.id),
          prevRules.findIndex((rule) => rule.id === over.id)
        )
      )
    }
  }

  const handleRuleChange = useCallback((id: string, field: string, value: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
  }, [])

  const prependRule = useCallback((index: number) => {
    const id = guid()
    // 获取当前筛选状态
    const filters = filterBarRef.current?.getFilters()
    // 确保 type 是有效的类型
    const typeFilter = filters?.typeFilter
    const validType = typeFilter && STANDARD_RULE_TYPES.includes(typeFilter as ClashRuleType) ? (typeFilter as ClashRuleType) : 'DOMAIN-SUFFIX'

    const newRule: ClashRule = {
      id,
      type: validType,
      value: '',
      action: filters?.actionFilter || 'DIRECT',
    }
    setRules((prev) => {
      const cloned = [...prev]
      cloned.splice(index, 0, newRule)
      return cloned
    })

    focusNextRef.current = id
  }, [])

  const addRule = useCallback(() => {
    const id = guid()
    // 获取当前筛选状态，如果存在则使用筛选的类型和动作
    const filters = filterBarRef.current?.getFilters()
    // 确保 type 是有效的类型
    const typeFilter = filters?.typeFilter
    const validType = typeFilter && STANDARD_RULE_TYPES.includes(typeFilter as ClashRuleType) ? (typeFilter as ClashRuleType) : 'DOMAIN-SUFFIX'

    const newRule: ClashRule = {
      id,
      type: validType,
      value: '',
      action: filters?.actionFilter || 'DIRECT',
    }
    setRules((prev) => [newRule, ...prev])

    focusNextRef.current = id
  }, [])

  const reset = () => {
    setRules([...defaultRules])
    setFilteredRules([...defaultRules])
  }

  const removeRule = useCallback((id: string) => {
    if (!confirm(`Are you sure you want to remove this rule?`)) {
      return
    }

    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }, [])

  const { run: submit, loading: submitting } = useRequest(() => putClashRules(rules), {
    manual: true,
    onSuccess: () => {
      alertRef.current?.show('Save Success')
    },
    onError: (error) => {
      alertRef.current?.show(error.message, { type: 'error' })
    },
  })

  const scrollToRule = (index: number) => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index, behavior: 'smooth', align: 'end' })
    }

    setTimeout(() => {
      if (formRef.current?.checkValidity()) {
        return
      }

      formRef.current?.reportValidity()
    }, 0)
  }

  const checkFormValidity = () => {
    const index = rules.findIndex((rule) => !isValidClashRule(rule))
    if (index === -1) {
      return true
    }

    scrollToRule(index)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!checkFormValidity()) {
      return
    }

    submit()
  }

  useEffect(() => {
    if (focusNextRef.current) {
      const id = focusNextRef.current
      focusNextRef.current = null

      const index = rules.findIndex((rule) => rule.id === id)
      scrollToRule(index)
    }
  }, [rules.length])

  // 使用 useMemo 稳定选项数组
  const typeOptions = useMemo(() => STANDARD_RULE_TYPES.map((type) => ({ label: type, value: type })), [])
  const actionOptions = useMemo(() => actions.map((action) => ({ label: action, value: action })), [actions])

  // 创建稳定的 onChange 处理函数，通过 event.target 的 data-id 来识别规则
  // 这样就不需要为每个规则创建新的回调函数
  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const ruleId = event.target.getAttribute('data-id')
      if (ruleId) {
        handleRuleChange(ruleId, 'value', event.target.value)
      }
    },
    [handleRuleChange]
  )

  const renderRule = useCallback(
    (rule: ClashRule, index: number) => {
      return (
        <SortableItem disabled={isFilterMode} key={rule.id} id={rule.id} data-rule-id={rule.id}>
          <ClearableSelect value={rule.type} options={typeOptions} onChange={(value) => handleRuleChange(rule.id, 'type', value)} />

          {rule.type === 'MATCH' ? (
            <input value="" placeholder="None" className="flex-grow h-8 text-sm border rounded-sm box-border px-3" disabled />
          ) : (
            <ControlledInput ruleId={rule.id} value={rule.value} onChange={handleValueChange} />
          )}

          <ClearableSelect value={rule.action} options={actionOptions} onChange={(value) => handleRuleChange(rule.id, 'action', value)} />

          <button
            onClick={() => prependRule(index)}
            className="flex-basis h-8 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 px-4"
            aria-label="Prepend ClashRule"
            type="button"
          >
            <BarsArrowUpIcon className="h-4 w-4 text-white" />
          </button>

          <button
            onClick={() => removeRule(rule.id)}
            className="flex-basis h-8 text-sm bg-red-500 text-white rounded-sm hover:bg-red-600 px-4"
            aria-label="Remove ClashRule"
            type="button"
          >
            <TrashIcon className="h-4 w-4 text-white" />
          </button>
        </SortableItem>
      )
    },
    [isFilterMode, handleRuleChange, typeOptions, actionOptions, prependRule, removeRule, handleValueChange]
  )

  const finalRules = isFilterMode ? filteredRules : rules

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <FilterBar ref={filterBarRef} rules={rules} onFilter={setFilteredRules} />

      <div className="mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rules.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
            <div style={{ height: '60vh' }}>
              <Virtuoso
                ref={virtuosoRef}
                totalCount={finalRules.length}
                itemContent={(index: number) => renderRule(finalRules[index], index)}
                style={{ height: '100%' }}
                fixedItemHeight={50}
              />
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <footer className="flex gap-2 mt-4">
        <div className="flex flex-col flex-grow">
          <Alert ref={alertRef} />
        </div>

        <div className="flex gap-2 ml-auto">
          <button onClick={addRule} className="ms-auto px-4 py-2 bg-indigo-500 cursor-pointer text-sm text-white rounded-sm hover:bg-indigo-600" type="button">
            Add
          </button>

          <button onClick={reset} className="px-4 py-2 bg-gray-500 cursor-pointer text-sm text-white rounded-sm hover:bg-gray-600" type="button">
            Reset
          </button>

          <button
            disabled={submitting}
            className="px-4 py-2 bg-green-500 cursor-pointer text-sm text-white rounded-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {submitting ? (
              <span className="w-5 h-5 flex flex-row items-center">
                <Spinner />
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </footer>
    </form>
  )
}
