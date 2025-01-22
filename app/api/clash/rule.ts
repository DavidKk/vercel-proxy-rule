'use server'

import { fetchClashRules, updateClashRules } from '@/services/clash/rule'
import { getGistInfo } from '@/services/gist'
import { isValidClashRule, type ClashRule } from '@/services/clash/types'
import { withAuthAction } from '@/initializer/wrapper'

export const getClashRules = withAuthAction(async () => {
  const { gistId, gistToken } = getGistInfo()
  return fetchClashRules({ gistId, gistToken })
})

export const putClashRules = withAuthAction(async (rules: ClashRule[]) => {
  const { gistId, gistToken } = getGistInfo()

  for (const rule of rules) {
    if (!isValidClashRule(rule)) {
      throw new Error('Invalid rule')
    }
  }

  await updateClashRules({ gistId, gistToken, rules })
})
