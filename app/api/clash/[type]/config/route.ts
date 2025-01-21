import { stringify } from 'yaml'
import { plainText } from '@/services/route/api'
import { getClashRules } from '@/app/api/clash/rule'
import { stringifyClashRule } from '@/services/clash/types'

export const GET = plainText<{ type: string }>(async (_, { params }) => {
  const { type } = await params
  const { rules } = await getClashRules()
  const payload = Array.from(
    (function* () {
      for (const rule of rules) {
        if (rule.action.toUpperCase() !== type.toUpperCase()) {
          continue
        }

        const content = stringifyClashRule(rule)
        const parts = content.split(',')
        const index = parts.indexOf(rule.action)
        yield parts.slice(0, index).join(',')
      }
    })()
  )

  return stringify({ payload })
})
