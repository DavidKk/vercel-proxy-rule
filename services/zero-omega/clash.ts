import type { ClashStandardRule } from '@/services/clash/types'

import type { ZeroOmega } from './types'

export function convertToClashRules(zeroOmega: ZeroOmega): ClashStandardRule[] {
  return Array.from<ClashStandardRule>(
    (function* () {
      for (const profileName in zeroOmega) {
        const profile = zeroOmega[profileName]
        if (!profile.rules) {
          continue
        }

        for (const rule of profile.rules) {
          const { condition, profileName } = rule
          if (condition.conditionType !== 'HostWildcardCondition') {
            continue
          }

          const { pattern } = condition
          const action = profileName === 'direct' ? 'DIRECT' : profileName
          if (pattern.startsWith('*.')) {
            const domain = pattern.slice(2)
            yield { type: 'DOMAIN-SUFFIX', value: domain, action }
            continue
          }

          if (pattern.includes('*')) {
            const keyword = pattern.replace(/\*/g, '')
            yield { type: 'DOMAIN-KEYWORD', value: keyword, action }
            continue
          }

          if (/^(\d+\.){3}\d+$/.test(pattern)) {
            yield { type: 'IP-CIDR', value: `${pattern}/32`, action }
            continue
          }

          yield { type: 'DOMAIN', value: pattern, action }
          continue
        }
      }
    })()
  )
}
