'use server'

import { withAuthAction } from '@/initializer/wrapper'
import { fetchWithCache } from '@/services/fetch'
import type { ZeroOmega } from '@/services/zero-omega/types'
import { convertArrayBufferToJson } from '@/utils/buffer'

export const getZeroOmegaConfig = withAuthAction(async () => {
  const zeroOmegaUrl = process.env.ZERO_OMEGA_URL
  if (!zeroOmegaUrl) {
    return null
  }

  const response = await fetchWithCache(zeroOmegaUrl)
  return convertArrayBufferToJson<ZeroOmega>(response)
})
