import { stringify } from 'yaml'
import { plainText } from '@/initializer/controller'
import { trimAction } from '@/initializer/wrapper'
import { getClashRules } from '@/app/api/clash/rule'
import { stringifyClashRule } from '@/services/clash/types'
import { convertToClashRules as convertGFWListToClashRules } from '@/services/gfwlist/clash'
import { convertToClashRules as convertZeroOmegaConfigToClashRules } from '@/services/zero-omega/clash'
import { getGFWList } from '@/app/api/gfwlist/list'
import { getZeroOmegaConfig } from '@/app/api/zero-omega/config'
import { getThirdPartyRejects } from './thirdParty'

export const GET = plainText<{ type: string }>(async (_, { params }) => {
  const { type } = await params
  const { rules } = await trimAction(getClashRules)()

  const zeroOmegaConfig = await trimAction(getZeroOmegaConfig)()
  if (zeroOmegaConfig) {
    const clashRules = convertZeroOmegaConfigToClashRules(zeroOmegaConfig)
    rules.splice(0, 0, ...clashRules)
  }

  const gfwRules = await trimAction(getGFWList)().catch(() => [])
  if (gfwRules) {
    const clashRules = convertGFWListToClashRules(gfwRules)
    rules.splice(0, 0, ...clashRules)
  }

  const thirdPartyRejectRuels = await getThirdPartyRejects()
  for (const rule of thirdPartyRejectRuels) {
    rule && rules.push(rule)
  }

  const payload = Array.from(
    new Set(
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
  )

  return stringify({ payload })
})
