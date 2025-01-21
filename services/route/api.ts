import { stringifyUnknownError } from '@/utils/response'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function api(handle: (req: NextRequest) => Promise<Record<string, any>>) {
  return async (req: NextRequest) => {
    try {
      const result = await handle(req)
      if (result instanceof NextResponse) {
        return result
      }

      const status = 'status' in result ? result.status : 200
      const headers = 'headers' in result ? result.headers : {}
      return NextResponse.json(result, { status, headers })
    } catch (error) {
      const message = stringifyUnknownError(error)
      return NextResponse.json(message, { status: 500 })
    }
  }
}

export function plainText(handle: (req: NextRequest) => Promise<string>) {
  return async (req: NextRequest) => {
    try {
      const result = await handle(req)
      return new NextResponse(result, { status: 200 })
    } catch (error) {
      const message = stringifyUnknownError(error)
      return new NextResponse(message, { status: 500 })
    }
  }
}

export interface JsonOptions {
  status?: number
  headers?: Headers
}

export function json(data: any, options: JsonOptions = {}) {
  return NextResponse.json(data, { status: 200, ...options })
}

export function success(data?: any, options: JsonOptions = {}) {
  return json({ code: 0, message: 'ok', data }, { status: 200, ...options })
}

export function invalidArgument(message: string, options: JsonOptions = {}) {
  return json({ message, code: 1, data: null }, { status: 400, ...options })
}
