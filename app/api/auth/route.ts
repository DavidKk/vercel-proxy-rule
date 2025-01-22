import { api } from '@/initializer/controller'
import { login } from './login'
import { jsonSuccess } from '@/initializer/response'

export const POST = api(async (req) => {
  const { username, password } = await req.json()
  const { cookie } = await login(username, password)

  const headers = new Headers()
  headers.append('Set-Cookie', cookie)

  return jsonSuccess(null, { headers })
})
