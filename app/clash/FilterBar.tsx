import { useEffect, useMemo, useState } from 'react'
import { BackspaceIcon } from '@heroicons/react/16/solid'
import ClearableSelect from '@/components/ClearableSelect'
import { fuzzySearch } from '@/utils/find'
import type { ClashRule } from './types'

export interface FilterBarProps {
  rules: ClashRule[]
  onFilter: (rules: ClashRule[]) => void
}

export function FilterBar(props: FilterBarProps) {
  const { rules, onFilter } = props
  const [valueFilter, setValueFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const uniqueActions = useMemo(() => Array.from(new Set(rules.map((rule) => rule.action))), [rules])
  const uniqueTypes = useMemo(() => Array.from(new Set(rules.map((rule) => rule.type))), [rules])

  useEffect(() => {
    const filteredRules = rules.filter((rule) => {
      if (valueFilter) {
        if (!('value' in rule)) {
          return false
        }

        return fuzzySearch(valueFilter, rule.value)
      }

      if (actionFilter) {
        return rule.action === actionFilter
      }

      if (typeFilter) {
        return rule.type === typeFilter
      }

      return true
    })

    onFilter(filteredRules)
  }, [rules, valueFilter, actionFilter, typeFilter, onFilter])

  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-end py-2 px-4 bg-gray-100 rounded-sm shadow-md">
      <ClearableSelect
        value={actionFilter}
        options={uniqueActions.map((action) => ({ value: action, label: action }))}
        onChange={(value) => setActionFilter(value)}
        placeholder="Filter by action"
      />

      <ClearableSelect
        value={typeFilter}
        options={uniqueTypes.map((type) => ({ value: type, label: type }))}
        onChange={(value) => setTypeFilter(value)}
        placeholder="Filter by type"
      />

      <input
        type="text"
        placeholder="Filter by value (domain)"
        className="h-8 text-sm border rounded-sm box-border px-3"
        value={valueFilter}
        onChange={(event) => setValueFilter(event.target.value)}
      />

      <button
        className="h-8 text-sm border-gray-300 border rounded-sm box-border px-3"
        onClick={() => {
          setValueFilter('')
          setActionFilter('')
          setTypeFilter('')
        }}
        type="button"
      >
        <BackspaceIcon className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  )
}
