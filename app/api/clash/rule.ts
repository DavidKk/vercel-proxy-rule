'use server'

import { fetchClashRules, updateClashRules } from '@/services/clash/rule'
import { getGistInfo } from '@/services/gist'
import type { ClashRule } from '@/services/clash/types'

export async function getClashRules() {
  const { gistId, gistToken } = getGistInfo()
  return fetchClashRules({ gistId, gistToken })
}

export async function putClashRules(rules: ClashRule[]) {
  const { gistId, gistToken } = getGistInfo()
  return updateClashRules({ gistId, gistToken, rules })
}
