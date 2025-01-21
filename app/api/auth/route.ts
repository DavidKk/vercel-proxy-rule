import { api, success } from '@/services/route/api'
import { login } from './login'

export const POST = api(async (req) => {
  const { username, password } = await req.json()
  const { cookie } = await login(username, password)

  const headers = new Headers()
  headers.append('Set-Cookie', cookie)

  return success(null, { headers })
})
