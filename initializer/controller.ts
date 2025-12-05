import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getHeaders, runWithContext } from '@/services/context'

import { isStandardResponse, standardResponseError, stringifyUnknownError } from './response'

export interface Context {
  params: Promise<any>
  searchParams: URLSearchParams
}

export interface ContextWithParams<P> extends Context {
  params: Promise<P>
}

export function api(handle: (req: NextRequest, context: Context) => Promise<Record<string, any>>) {
  return async (req: NextRequest, context: { params: Promise<any> }) => {
    return runWithContext(async () => {
      try {
        const enhancedContext: Context = {
          params: context.params,
          searchParams: req.nextUrl.searchParams,
        }
        const result = await handle(req, enhancedContext)
        if (result instanceof NextResponse) {
          return result
        }

        const status = 'status' in result ? result.status : 200
        const inputHeaders = 'headers' in result ? result.headers : {}
        const collectHeaders = getHeaders()
        const headers = { ...collectHeaders, ...inputHeaders }
        return NextResponse.json(result, { status, headers })
      } catch (error) {
        if (error instanceof NextResponse) {
          return error
        }

        const result = (() => {
          if (isStandardResponse(error)) {
            return error
          }

          const message = stringifyUnknownError(error)
          return standardResponseError(message)
        })()

        return NextResponse.json(result, { status: 500 })
      }
    })
  }
}

export function plainText<P>(handle: (req: NextRequest, context: ContextWithParams<P>) => Promise<string>) {
  return async (req: NextRequest, context: { params: Promise<any> }) => {
    return runWithContext(async () => {
      try {
        const enhancedContext: ContextWithParams<P> = {
          params: context.params,
          searchParams: req.nextUrl.searchParams,
        }
        const result = await handle(req, enhancedContext)
        const headers = getHeaders()
        return new NextResponse(result, { status: 200, headers })
      } catch (error) {
        const message = stringifyUnknownError(error)
        return new NextResponse(message, { status: 500 })
      }
    })
  }
}

export function stream<P>(handle: (req: NextRequest, context: ContextWithParams<P>, controller: ReadableStreamDefaultController<any>) => Promise<void>) {
  return async (req: NextRequest, context: { params: Promise<any> }) => {
    return runWithContext(async () => {
      const enhancedContext: ContextWithParams<P> = {
        params: context.params,
        searchParams: req.nextUrl.searchParams,
      }
      const writeStream = new ReadableStream({
        async start(controller) {
          try {
            await handle(req, enhancedContext, controller)
          } finally {
            controller.close()
          }
        },
      })

      const headers = getHeaders()
      return new NextResponse(writeStream, { status: 200, headers })
    })
  }
}
