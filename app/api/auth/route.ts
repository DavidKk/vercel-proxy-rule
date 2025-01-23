import { api } from '@/initializer/controller'
import { login } from './login'
import { jsonSuccess } from '@/initializer/response'

export const POST = api(async (req) => {
  const { username, password, token } = await req.json()
  const { cookie } = await login(username, password, token)

  const headers = new Headers()
  headers.append('Set-Cookie', cookie)

  return jsonSuccess(null, { headers })
})
