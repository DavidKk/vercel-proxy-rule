import { stringify } from 'yaml'

import { plainText } from '@/initializer/controller'
import { trimAction } from '@/initializer/wrapper'
import { stringifyClashRule } from '@/services/clash/types'
import { convertToClashRules } from '@/services/zero-omega/clash'

import { getZeroOmegaConfig } from './config'

export const GET = plainText(async () => {
  const zeroOmegaConfig = await trimAction(getZeroOmegaConfig)()
  if (!zeroOmegaConfig) {
    return stringify({ payload: [] })
  }

  const rules = convertToClashRules(zeroOmegaConfig)
  return stringify({ rules: rules.map(stringifyClashRule) })
})
