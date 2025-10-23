'use server'

import { withAuthAction } from '@/initializer/wrapper'
import { fetchWithCache } from '@/services/fetch'
import { parseGFWList } from '@/services/gfwlist/parse'
import { convertArrayBufferToString } from '@/utils/buffer'

import { GFW_LIST_URL } from './constants'

export const getGFWList = withAuthAction(async () => {
  if (process.env.NODE_ENV === 'development') {
    return []
  }

  const response = await fetchWithCache(GFW_LIST_URL)
  const text = convertArrayBufferToString(response)
  const buffer = Buffer.from(text, 'base64')
  const content = buffer.toString()
  return parseGFWList(content)
})
