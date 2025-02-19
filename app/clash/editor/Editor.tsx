'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRequest } from 'ahooks'
import Stackblitz from '@stackblitz/sdk'
import type { Project, VM } from '@stackblitz/sdk'
import { CloudArrowUpIcon } from '@heroicons/react/16/solid'
import { Spinner } from '@/components/Spinner'
import { updateFiles } from '@/app/api//gfwlist/actions'
import { PACKAGE_FILE } from './constants'

export interface File {
  content: string
}

export interface EditorProps {
  files: Record<string, File>
}

export default function Editor(props: EditorProps) {
  const { files: inFiles } = props
  const { ref: editorRef, container } = useEditor()
  const [vm, setVM] = useState<VM>()

  const { run: save, loading } = useRequest(
    async () => {
      if (!vm) {
        return
      }

      const snapshot = await vm.getFsSnapshot()
      if (!snapshot) {
        return
      }

      const needUpdateFiles = Array.from<{ file: string; content: string | null }>(
        (function* () {
          for (const [file, content] of Object.entries(snapshot)) {
            if (file === PACKAGE_FILE) {
              continue
            }

            if (!content) {
              continue
            }

            yield { file, content }
          }
        })()
      )

      Object.entries(inFiles).forEach(([file]) => {
        if (needUpdateFiles.some(({ file: f }) => f === file)) {
          return
        }

        needUpdateFiles.push({ file, content: null })
      })

      await updateFiles(...needUpdateFiles)
    },
    {
      manual: true,
      throttleWait: 1e3,
    }
  )

  useEffect(() => {
    ;(async () => {
      if (!editorRef.current) {
        return
      }

      if (!editorRef.current.checkVisibility()) {
        return
      }

      const files = Object.fromEntries(
        (function* () {
          for (const [file, { content }] of Object.entries(inFiles)) {
            yield [file, content]
          }
        })()
      )

      const project: Project = { template: 'javascript', title: 'test', files }
      const vm = await Stackblitz.embedProject(editorRef.current, project, {
        view: 'editor',
        showSidebar: true,
      })

      setVM(vm)
    })()
  }, [])

  return (
    <div className="w-screen h-[calc(100vh-60px)] relative bg-black">
      {container}

      {!vm ? (
        <div className="fixed w-8 h-8 top-0 left-0 right-0 bottom-0 m-auto">
          <span className="w-8 h-8 flex items-center justify-center">
            <Spinner />
          </span>
        </div>
      ) : (
        <button
          disabled={loading}
          onClick={save}
          className="fixed bottom-10 right-2 px-6 py-4 bg-indigo-500 text-white rounded-md shadow-lg disable:opacity-100 flex flex-col items-center"
        >
          <span className="w-8 h-8 flex items-center justify-center">{loading ? <Spinner /> : <CloudArrowUpIcon />}</span>
          <span>Save</span>
        </button>
      )}
    </div>
  )
}

export function useEditor() {
  const ref = useRef<HTMLDivElement>(null)
  const container = useMemo(() => <div ref={ref} className="w-full h-full"></div>, [])
  return { container, ref }
}
