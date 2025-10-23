import { parse } from 'yaml'
import { parseRuleRaw } from '@/services/clash/utils'
import { fetchWithCache } from '@/services/fetch'
import { convertArrayBufferToString } from '@/utils/buffer'
import { REJECT_FORWARD_RULES } from './constants'
import { chunk } from '@/utils/chunk'
import type { ClashExtendedRule, ClashMatchRule, ClashStandardRule } from '@/services/clash/types'

export async function getThirdPartyRejects() {
  const finalRules: (ClashMatchRule | ClashExtendedRule | ClashStandardRule)[] = []
  const chunks = chunk(REJECT_FORWARD_RULES, 10)

  for (const urls of chunks) {
    const promises = urls.map(async (url) => {
      const response = await fetchWithCache(url)
      const content = convertArrayBufferToString(response)
      const doc = parse(content) as Record<'payload', string[]>
      return doc?.payload || []
    })

    const sources = await Promise.allSettled(promises)
    const contents = sources.filter((source) => source.status === 'fulfilled')
    const rules = contents.flatMap((itme) => itme.value.map((raw) => parseRuleRaw(raw, 'REJECT')))
    for (const rule of rules) {
      rule && finalRules.push(rule)
    }
  }

  return finalRules
}
