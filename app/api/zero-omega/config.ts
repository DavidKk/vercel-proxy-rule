'use server'

import { withAuthAction } from '@/initializer/wrapper'
import { readGistFile } from '@/services/gist'
import type { ZeroOmega } from '@/services/zero-omega/types'

export const getZeroOmegaConfig = withAuthAction(async () => {
  const gistId = process.env.ZERO_OMEGA_GIST_ID
  const gistToken = process.env.ZERO_OMEGA_GIST_TOKEN
  if (!gistId || !gistToken) {
    return null
  }

  const fileName = 'ZeroOmega.json'
  const content = await readGistFile({ gistId, gistToken, fileName })
  return JSON.parse(content) as ZeroOmega
})
