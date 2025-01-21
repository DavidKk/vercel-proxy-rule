'use server'

import { serialize } from 'cookie'
import { generateToken } from '@/utils/jwt'
import { AUTH_TOKEN_NAME } from './constants'

export async function login(username: string, password: string) {
  if (!username) {
    throw new Error('Username is required')
  }

  if (!password) {
    throw new Error('Password is required')
  }

  if (process.env.ACCESS_USERNAME !== username || process.env.ACCESS_PASSWORD !== password) {
    throw new Error('Invalid username or password')
  }

  const token = generateToken({ authenticated: true })
  const cookie = serialize(AUTH_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60,
    path: '/',
  })

  return { cookie }
}
