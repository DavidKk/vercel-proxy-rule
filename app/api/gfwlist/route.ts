import { stringify } from 'yaml'
import { plainText } from '@/initializer/controller'
import { trimAction } from '@/initializer/wrapper'
import { convertToClashRules } from '@/services/gfwlist/clash'
import { stringifyClashRule } from '@/services/clash/types'
import { getGFWList } from './list'

export const GET = plainText(async () => {
  const gfwRules = await trimAction(getGFWList)()
  const rules = convertToClashRules(gfwRules)
  const payload = Array.from(
    (function* () {
      for (const rule of rules) {
        const content = stringifyClashRule(rule)
        const parts = content.split(',')
        const index = parts.indexOf(rule.action)
        const result = parts.slice(0, index).join(',')
        if (!result) {
          continue
        }

        yield result
      }
    })()
  )

  return stringify({ payload })
})
