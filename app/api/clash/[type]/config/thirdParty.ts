import { parse } from 'yaml'

import { parseRuleRaw } from '@/services/clash/utils'
import { fetchWithCache } from '@/services/fetch'
import { convertArrayBufferToString } from '@/utils/buffer'

import { IOS_RULE_SCRIPT_URL } from './constants'

export async function getThirdPartyRejects() {
  const response = await fetchWithCache(IOS_RULE_SCRIPT_URL, { cacheDuration: 86400 * 1000 })
  const content = convertArrayBufferToString(response)
  const doc = parse(content) as Record<'payload', string[]>
  const raws = doc?.payload || []
  const rules = raws.map((raw) => parseRuleRaw(raw, 'REJECT'))

  // eslint-disable-next-line no-console
  console.log(`Fetch ${rules.length} reject rules from ${IOS_RULE_SCRIPT_URL}`)
  return rules
}
