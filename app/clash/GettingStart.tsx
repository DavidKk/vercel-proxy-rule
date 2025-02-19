'use client'

import { v4 as uuid } from 'uuid'
import { useEffect, useRef, useState } from 'react'
import type { AlertImperativeHandler } from '@/components/Alert'
import Alert from '@/components/Alert'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/16/solid'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

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
  secret: string
  actions?: string[]
}

export function GettingStart(props: GettingStartProps) {
  const { secret, actions = [] } = props
  const alertRef = useRef<AlertImperativeHandler>(null)
  const [baseUrl, setBaseUrl] = useState<string>('')

  const rules = actions.map<Rule>((name) => ({ type: 'RULE-SET', name, value: name }))
  const ruleProviders = actions.map<RuleProvider>((name) => ({
    name,
    type: 'http',
    behavior: 'classical',
    interval: 86400,
    format: 'yaml',
    url: `${baseUrl}/api/clash/${name}/config`,
    path: `./rules/${name}.yaml`,
  }))

  const markdownContent = `
mixed-port: 7890
allow-lan: true
mode: Rule
external-controller: 127.0.0.1:12345
secret: ${secret}
log-level: info

# @see https://en.clash.wiki/configuration/outbound.html#proxies
proxies:
  - name: Clash

proxy-groups:
  - name: Proxy
    type: select
    proxies:
      - Clash               # Enter above server name
  - name: MATCH
    type: select
    proxies:
      - Proxy
      - DIRECT
  - name: Streaming
    type: select
    proxies:
      - Proxy
  - name: StreamingSE
    type: select
    proxies:
      - DIRECT
  - name: ChatGPT
    type: select
    proxies:
      - Proxy                 # China not allowd (incldue HK & TW & MO)

rule-providers: ${ruleProviders
    .map(
      ({ name, type, behavior, interval, format, url, path }) => `
  ${name}:
    type: ${type}
    behavior: ${behavior}
    interval: ${interval}
    format: ${format}
    url: ${url}
    path: ${path}`
    )
    .join('')}
rules:\n${rules.map(({ type, name, value }) => `  - ${type},${name},${value}`).join('\n')}
`.trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent)
    alertRef.current?.show('Copied to clipboard')
  }

  useEffect(() => {
    const { protocol, hostname } = window.location
    setBaseUrl(`${protocol}//${hostname}`)
  }, [])

  return (
    <div>
      <Alert ref={alertRef} />

      <div className="divide-y divide-gray-200 relative">
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1 border border-gray-400 text-gray-400 rounded-md">
          <ClipboardDocumentCheckIcon className="h-5 w-5" />
        </button>

        <div className="bg-gray-100 p-4 rounded-md shadow-md mt-4">
          <SyntaxHighlighter style={docco} language="yaml">
            {markdownContent}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
