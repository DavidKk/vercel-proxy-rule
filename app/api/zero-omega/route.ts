import { stringify } from 'yaml'
import { stringifyClashRule } from '@/services/clash/types'
import { plainText } from '@/initializer/controller'
import { trimAction } from '@/initializer/wrapper'
import { getZeroOmegaConfig } from './config'
import { convertToClashRules } from '@/services/zero-omega/clash'

export const GET = plainText(async () => {
  const zeroOmegaConfig = await trimAction(getZeroOmegaConfig)()
  if (!zeroOmegaConfig) {
    return stringify({ payload: [] })
  }

  const rules = convertToClashRules(zeroOmegaConfig)
  return stringify({ rules: rules.map(stringifyClashRule) })
})
