'use client'

import { useEffect, useRef, useState } from 'react'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/16/solid'

interface Rule {
  type: string
  name: string
  value: string
}

interface RuleProvider {
  type: string
  behavior: string
  interval: number
  format: string
  name: string
  url: string
  path: string
}

export interface GettingStartProps {
  actions?: string[]
}

export function GettingStart(props: GettingStartProps) {
  const { actions = [] } = props
  const alertRef = useRef<AlertImperativeHandler>(null)
  const [baseUrl, setBaseUrl] = useState<string>('')

  const handleCopy = () => {
    const strProviders = ruleProviders.flatMap(({ name, type, behavior, interval, format, url, path }) => [
      `${name}:`,
      `  type: ${type}`,
      `  behavior: ${behavior}`,
      `  interval: ${interval}`,
      `  format: ${format}`,
      `  url: ${url}`,
      `  path: ${path}`,
    ])

    const strRules = rules.map(({ type, name, value }) => `  - ${type},${name},${value}`)
    const textToCopy = ['rule-providers:', strProviders.map((c) => `  ${c}`).join('\n'), 'rules:', strRules.join('\n')]
    navigator.clipboard.writeText(textToCopy.join('\n').trim())

    alertRef.current?.show('Copied to clipboard')
  }

  useEffect(() => {
    const { protocol, hostname } = window.location
    setBaseUrl(`${protocol}//${hostname}`)
  }, [])

  const ruleProviders = actions.map<RuleProvider>((name) => ({
    name,
    type: 'http',
    behavior: 'classical',
    interval: 86400,
    format: 'yaml',
    url: `${baseUrl}/api/clash/${name}/config`,
    path: `./rules/${name}.yaml`,
  }))

  const rules = actions.map<Rule>((name) => ({ type: 'RULE-SET', name, value: name }))

  return (
    <div>
      <Alert ref={alertRef} />

      <div className="divide-y divide-gray-200 relative">
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1 border border-gray-400 text-gray-400 rounded-md">
          <ClipboardDocumentCheckIcon className="h-5 w-5" />
        </button>

        <pre className="bg-gray-100 p-4 rounded-md shadow-md mt-4">
          <code className="block font-medium text-gray-700 text-blue-700">rule-providers:</code>
          {ruleProviders.map(({ name, type, behavior, interval, format, url, path }, index) => (
            <code className="block ml-4" key={index}>
              <span className="ml-2 text-blue-700">{name}</span>
              <code className="block ml-4">
                <code className="block ml-2">
                  <span className="text-blue-700">type</span>: <span className="text-yellow-600">{type}</span>
                </code>
                <code className="block ml-2">
                  <span className="text-blue-600">behavior</span>: <span className="text-yellow-600">{behavior}</span>
                </code>
                <code className="block ml-2">
                  <span className="text-blue-600">interval</span>: <span className="text-green-600">{interval}</span>
                </code>
                <code className="block ml-2">
                  <span className="text-blue-600">format</span>: <span className="text-yellow-600">{format}</span>
                </code>
                <code className="block ml-2">
                  <span className="text-blue-600">url</span>: <span className="text-yellow-600">{url}</span>
                </code>
                <code className="block ml-2">
                  <span className="text-blue-600">path</span>: <span className="text-yellow-600">{path}</span>
                </code>
              </code>
            </code>
          ))}
          <br />
          <code className="block font-medium text-gray-700 text-blue-700">rules:</code>
          {rules.map(({ type, name, value }, index) => (
            <code className="block ml-4" key={index}>
              <span>-</span>
              <span className="ml-2 text-yellow-600">
                {type},{name},{value}
              </span>
            </code>
          ))}
        </pre>
      </div>
    </div>
  )
}
