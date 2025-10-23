import type { NextRequest } from 'next/server'

import { api } from '@/initializer/controller'
import { jsonInvalidParameters } from '@/initializer/response'
import { trimAction, withAuthHandler } from '@/initializer/wrapper'
import { isValidClashRule } from '@/services/clash/types'

import { getClashRules, putClashRules } from './rule'

export const GET = api(
  withAuthHandler(async () => {
    return trimAction(getClashRules)()
  })
)

export const POST = api(
  withAuthHandler(async (req: NextRequest) => {
    const { rules } = await req.json()
    if (!Array.isArray(rules)) {
      return jsonInvalidParameters('rules must be an array')
    }

    if (rules.find(isValidClashRule)) {
      return jsonInvalidParameters('invalid rule')
    }

    await trimAction(putClashRules)(rules)
    return {}
  })
)
