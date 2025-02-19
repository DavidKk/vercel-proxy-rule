'use client'

import { useRequest } from 'ahooks'
import React, { useEffect, useRef, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { BarsArrowUpIcon, TrashIcon } from '@heroicons/react/16/solid'
import { putClashRules } from '@/app/api/clash/rule'
import { Spinner } from '@/components/Spinner'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import ClearableSelect from '@/components/ClearableSelect'
import { guid } from '@/utils/guid'
import SortableItem from './SortableItem'
import { FilterBar } from './FilterBar'
import type { ClashRule } from './types'
import { isValidClashRule, STANDARD_RULE_TYPES } from '@/services/clash/types'

export interface RuleManagerProps {
  rules: ClashRule[]
  actions: string[]
}

export default function RuleManager(props: RuleManagerProps) {
  const { rules: defaultRules, actions } = props
  const [rules, setRules] = useState([...defaultRules])
  const [filteredRules, setFilteredRules] = useState(rules)
  const alertRef = useRef<AlertImperativeHandler>(null)
  const focusNextRef = useRef<string>(null)
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))
  const formRef = useRef<HTMLFormElement>(null)
  const listRef = useRef<List>(null)
  const [listHeight, setListHeight] = useState(0)

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

  const handleRuleChange = (id: string, field: string, value: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
  }

  const prependRule = (index: number) => {
    const id = guid()
    const newRule: ClashRule = { id, type: 'DOMAIN-SUFFIX', value: '', action: 'DIRECT' }
    setRules((prev) => {
      const cloned = [...prev]
      cloned.splice(index, 0, newRule)
      return cloned
    })

    focusNextRef.current = id
  }

  const addRule = () => {
    const id = guid()
    const newRule: ClashRule = { id, type: 'DOMAIN-SUFFIX', value: '', action: 'DIRECT' }
    setRules((prev) => [newRule, ...prev])

    focusNextRef.current = id
  }

  const reset = () => {
    setRules([...defaultRules])
    setFilteredRules([...defaultRules])
  }

  const removeRule = (id: string) => {
    if (!confirm(`Are you sure you want to remove this rule?`)) {
      return
    }

    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }

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
    listRef.current?.scrollToItem(index, 'end')

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

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(window.innerHeight * 0.6)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  const renderRule = (rule: ClashRule, index: number) => {
    return (
      <SortableItem disabled={isFilterMode} key={rule.id} id={rule.id}>
        <ClearableSelect
          value={rule.type}
          options={STANDARD_RULE_TYPES.map((type) => ({ label: type, value: type }))}
          onChange={(value) => handleRuleChange(rule.id, 'type', value)}
        />

        {rule.type === 'MATCH' ? (
          <input value="" placeholder="None" className="flex-grow h-8 text-sm border rounded-sm box-border px-3" disabled />
        ) : (
          <input
            type="text"
            value={rule.value}
            onChange={(event) => handleRuleChange(rule.id, 'value', event.target.value)}
            placeholder="Value"
            className="flex-grow h-8 text-sm border rounded-sm box-border px-3"
            required
            data-id={rule.id}
          />
        )}

        <ClearableSelect
          value={rule.action}
          options={actions.map((action) => ({ label: action, value: action }))}
          onChange={(value) => handleRuleChange(rule.id, 'action', value)}
        />

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
  }

  const finalRules = isFilterMode ? filteredRules : rules
  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <FilterBar rules={rules} onFilter={setFilteredRules} />

      <div className="mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rules.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-wrap flex-col gap-2">
              <List layout="vertical" itemCount={finalRules.length} itemSize={50} height={listHeight} width="auto" ref={listRef}>
                {({ index, style }) => (
                  <div className="flex" style={style}>
                    {renderRule(finalRules[index], index)}
                  </div>
                )}
              </List>
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
