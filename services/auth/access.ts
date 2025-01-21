import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_TOKEN_NAME } from '@/app/api/auth/constants'
import { verifyToken } from '@/utils/jwt'

export interface CheckAccessOptions {
  redirectUrl?: string
}

export async function validateCookie() {
  const cookieStore = await cookies()
  const authInfo = cookieStore.get(AUTH_TOKEN_NAME)
  if (!authInfo) {
    return false
  }

  const token = authInfo.value
  const user = token ? verifyToken(token) : null
  if (!user) {
    return false
  }

  return true
}

export async function checkAccess(options?: CheckAccessOptions) {
  const { redirectUrl = '/login' } = options || {}

  if (await validateCookie()) {
    return
  }

  redirect(redirectUrl)
}

export interface CheckUnAccessOptions {
  redirectUrl?: string
}

export async function checkUnAccess(options?: CheckUnAccessOptions) {
  const { redirectUrl = '/' } = options || {}

  if (!(await validateCookie())) {
    return
  }

  redirect(redirectUrl)
}
