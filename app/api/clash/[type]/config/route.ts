import { stringify } from 'yaml'
import { plainText } from '@/initializer/controller'
import { trimAction } from '@/initializer/wrapper'
import { getClashRules } from '@/app/api/clash/rule'
import { stringifyClashRule } from '@/services/clash/types'
import { convertToClashRules } from '@/services/gfwlist/clash'
import { getGFWList } from '../../gfwlist/list'

export const GET = plainText<{ type: string }>(async (_, { params }) => {
  const { type } = await params
  const { rules } = await trimAction(getClashRules)()

  const upperType = type.toUpperCase()
  if (upperType === 'PROXY') {
    const gfwRules = await trimAction(getGFWList)()
    const clashRules = convertToClashRules(gfwRules)
    rules.splice(0, 0, ...clashRules)
  }

  const payload = Array.from(
    new Set((function* () {
      for (const rule of rules) {
        if (rule.action.toUpperCase() !== upperType) {
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
    })())
  )

  return stringify({ payload })
})
