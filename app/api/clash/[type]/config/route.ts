import { stringify } from 'yaml'
import { getClashRules } from '@/app/api/clash/rule'
import { stringifyClashRule } from '@/services/clash/types'
import { plainText } from '@/initializer/controller'
import { trimAction } from '@/initializer/wrapper'

export const GET = plainText<{ type: string }>(async (_, { params }) => {
  const { type } = await params
  const { rules } = await trimAction(getClashRules)()
  const payload = Array.from(
    (function* () {
      for (const rule of rules) {
        if (rule.action.toUpperCase() !== type.toUpperCase()) {
          continue
        }

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
