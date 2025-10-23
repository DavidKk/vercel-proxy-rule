import { parse, stringify } from 'yaml'

import { type FetchGistFileParams, readGistFile, writeGistFile } from '@/services/gist'

import { CLASH_CONFIG_FILE, CLASH_DEFAULT_ACTION } from './constants'
import type { ClashConfig, ClashExtendedRule, ClashMatchRule, ClashRule, ClashStandardRule } from './types'
import { stringifyClashRule } from './types'
import { parseRuleRaw } from './utils'

export async function fetchClashRules(params: FetchGistFileParams) {
  const { gistId, gistToken } = params
  const content = await readGistFile({ gistId, gistToken, fileName: CLASH_CONFIG_FILE })
  const config: ClashConfig = parse(content)
  const strRules = config?.rules

  const rules: (ClashMatchRule | ClashExtendedRule | ClashStandardRule)[] = []
  if (!Array.isArray(strRules) || strRules.length === 0) {
    return { rules, actions: [] as string[] }
  }

  const actionSet = new Set<string>(CLASH_DEFAULT_ACTION)
  for (const ruleRaw of strRules) {
    const rule = parseRuleRaw(ruleRaw)
    if (!rule) {
      continue
    }

    actionSet.add(rule.action)
    rules.push(rule)
  }

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
