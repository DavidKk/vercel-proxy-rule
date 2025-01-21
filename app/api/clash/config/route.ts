import { plainText } from '@/services/route/api'
import { getClashYaml } from './yaml'

export const GET = plainText(async () => {
  return getClashYaml()
})
