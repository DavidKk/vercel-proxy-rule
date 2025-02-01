'use server'

import { withAuthAction } from '@/initializer/wrapper'
import { parseGFWList } from '@/services/gfwlist/parse'
import { fetchWithCache } from '@/services/fetch'
import { convertArrayBufferToString } from '@/utils/buffer'
import { GFW_LIST_URL } from './constants'

export const getGFWList = withAuthAction(async () => {
  const response = await fetchWithCache(GFW_LIST_URL)
  const text = convertArrayBufferToString(response)
  const buffer = Buffer.from(text, 'base64')
  const content = buffer.toString()
  return parseGFWList(content)
})
