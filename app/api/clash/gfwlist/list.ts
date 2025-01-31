'use server'

import { withAuthAction } from '@/initializer/wrapper'
import { parseGFWList } from '@/services/gfwlist/parse'
import { GFW_LIST_URL } from './constants'

export const getGFWList = withAuthAction(async () => {
  const response = await fetch(GFW_LIST_URL)
  if (!response.ok) {
    throw new Error('Failed to fetch GFW list')
  }

  const text = await response.text()
  const buffer = Buffer.from(text, 'base64')
  const content = buffer.toString()
  return parseGFWList(content)
})
