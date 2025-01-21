'use client'

import React, { useEffect, useRef, useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { BarsArrowUpIcon, TrashIcon } from '@heroicons/react/16/solid'
import type { ClashRule } from '@/services/clash/types'
import { putClashRules } from '@/app/api/clash/rule'
import { Spinner } from '@/components/Spinner'
import Alert from '@/components/Alert'
import { guid } from '@/utils/guid'
import SortableItem from './SortableItem'
import { RULE_TYPE } from './constants'
import { useRequest } from 'ahooks'

export type Rule = ClashRule & { id: string }

export interface RuleManagerProps {
  rules: Rule[]
  actions: string[]
}

export default function RuleManager(props: RuleManagerProps) {
  const { rules: defaultRules, actions } = props
  const [rules, setRules] = useState(defaultRules)
  const [showSuccess, toggleSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const focusNextRef = useRef<string>(null)
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

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
    const newRule: Rule = { id, type: 'DOMAIN-SUFFIX', value: '', action: 'DIRECT' }
    setRules((prev) => {
      prev.splice(index, 0, newRule)
      return [...prev]
    })

    focusNextRef.current = id
  }

  const addRule = () => {
    const id = guid()
    const newRule: Rule = { id, type: 'DOMAIN-SUFFIX', value: '', action: 'DIRECT' }
    setRules((prev) => [...prev, newRule])

    focusNextRef.current = id
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
      toggleSuccess(true)
      setErrorMessage('')
    },
    onError: (error) => {
      setErrorMessage(error.message)
      toggleSuccess(false)
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const form = event.currentTarget as HTMLFormElement
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    submit()
  }

  useEffect(() => {
    if (focusNextRef.current) {
      const id = focusNextRef.current
      focusNextRef.current = null

      const input = document.querySelector<HTMLInputElement>(`input[data-id="${id}"]`)
      input && input.focus()
    }
  }, [rules])

  const renderRule = (rule: Rule, index: number) => {
    return (
      <SortableItem key={rule.id} id={rule.id}>
        <select
          value={rule.type}
          onChange={(e) => handleRuleChange(rule.id, 'type', e.target.value)}
          className="h-8 text-sm border rounded-sm box-border pl-1 md:pl-3 w-full md:w-auto"
        >
          {RULE_TYPE.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {rule.type === 'MATCH' ? (
          <input value="" placeholder="None" className="w-full h-8 text-sm border rounded-sm box-border px-3" disabled />
        ) : (
          <input
            type="text"
            value={rule.value}
            onChange={(e) => handleRuleChange(rule.id, 'value', e.target.value)}
            placeholder="Value"
            className="w-full h-8 text-sm border rounded-sm box-border px-3"
            required
            data-id={rule.id}
          />
        )}

        <select
          value={rule.action}
          onChange={(e) => handleRuleChange(rule.id, 'action', e.target.value)}
          className="ml-auto flex-basis h-8 text-sm border rounded-sm box-border pl-1 md:pl-3 w-full md:w-auto"
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        <button
          onClick={() => prependRule(index)}
          className="flex-basis h-8 text-sm bg-orange-500 text-white rounded-sm hover:bg-orange-600 px-4"
          aria-label="Prepend Rule"
          type="button"
        >
          <BarsArrowUpIcon className="h-4 w-4 text-white" />
        </button>

        <button
          onClick={() => removeRule(rule.id)}
          className="flex-basis h-8 text-sm bg-red-500 text-white rounded-sm hover:bg-red-600 px-4"
          aria-label="Remove Rule"
          type="button"
        >
          <TrashIcon className="h-4 w-4 text-white" />
        </button>
      </SortableItem>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="h-[70vh] md:h-[60vh] overflow-auto overflow-x-hidden mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rules.map((rule) => rule.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-wrap flex-col gap-2">{rules.map(renderRule)}</div>
          </SortableContext>
        </DndContext>
      </div>

      <footer className="flex gap-2 mt-4">
        <div className="flex flex-col flex-grow">
          {showSuccess && <Alert type="success" message="Save Success" onClear={() => toggleSuccess(false)} />}
          {errorMessage && <Alert type="error" message={errorMessage} onClear={() => setErrorMessage('')} />}
        </div>

        <div className="flex gap-2 ml-auto">
          <button onClick={addRule} className="ms-auto px-4 py-2 bg-blue-500 cursor-pointer text-sm text-white rounded-sm hover:bg-blue-600" type="button">
            Add Rule
          </button>

          <button
            disabled={submitting}
            className="px-4 py-2 bg-green-500 cursor-pointer text-sm text-white rounded-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {submitting ? <Spinner /> : 'Save'}
          </button>
        </div>
      </footer>
    </form>
  )
}
