import { parse, stringify } from 'yaml'
import { CLASH_CONFIG_FILE, CLASH_DEFAULT_ACTION } from './constants'
import { type FetchGistFileParams, readGistFile, writeGistFile } from '@/services/gist'
import { stringifyClashRule, type ClashConfig, type ClashExtendedRule, type ClashMatchRule, type ClashRule, type ClashStandardRule } from './types'

export async function fetchClashRules(params: FetchGistFileParams) {
  const { gistId, gistToken } = params
  const content = await readGistFile({ gistId, gistToken, fileName: CLASH_CONFIG_FILE })
  const config: ClashConfig = parse(content)
  const strRules = config?.rules

  if (!Array.isArray(strRules) || strRules.length === 0) {
    return { rules: [], actions: [] }
  }

  const actionSet = new Set<string>(CLASH_DEFAULT_ACTION)
  const rules = Array.from(
    (function* () {
      for (const rule of strRules) {
        const [type, ...rest] = rule.split(',')
        switch (type) {
          case 'MATCH': {
            const [action] = rest
            yield { type, action } as ClashMatchRule
            actionSet.add(action)
            break
          }
          case 'IP-CIDR6': {
            const [value, action, flag] = rest
            yield { type, value, action, flag } as ClashExtendedRule
            actionSet.add(action)
            break
          }
          case 'DOMAIN-SUFFIX':
          case 'DOMAIN-KEYWORD':
          case 'IP-CIDR':
          case 'SRC-IP-CIDR':
          case 'SRC-PORT':
          case 'DST-PORT':
          case 'GEOIP': {
            const [value, action] = rest
            yield { type, value, action } as ClashStandardRule
            actionSet.add(action)
            break
          }
          default:
            break
        }
      }
    })()
  )

  const actions = Array.from(actionSet)
  return { rules, actions, config }
}

export interface UpdateClashRulesParams {
  gistId: string
  gistToken: string
  rules: ClashRule[]
}

export async function updateClashRules(params: UpdateClashRulesParams) {
  const { gistId, gistToken, rules } = params
  const { config } = await fetchClashRules({ gistId, gistToken })

  const parts = []
  for (const rule of rules) {
    const content = stringifyClashRule(rule)
    if (!content) {
      continue
    }

    parts.push(content)
  }

  const content = stringify({ ...config, rules: parts })
  await writeGistFile({ gistId, gistToken, file: CLASH_CONFIG_FILE, content })
}
