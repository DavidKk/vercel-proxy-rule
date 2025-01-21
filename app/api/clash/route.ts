import type { NextRequest } from 'next/server'
import { api, invalidArgument } from '@/services/route/api'
import { getClashRule, putClashRules } from './rule'
import { isValidClashRule } from '@/services/clash/types'

export const GET = api(async () => {
  return getClashRule()
})

export const POST = api(async (req: NextRequest) => {
  const { rules } = await req.json()
  if (!Array.isArray(rules)) {
    return invalidArgument('rules must be an array')
  }

  if (rules.find(isValidClashRule)) {
    return invalidArgument('invalid rule')
  }

  await putClashRules(rules)
  return {}
})
