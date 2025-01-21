'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'

export interface SortableItemProps {
  id: string
  children: React.ReactNode
}

export default function SortableItem(props: SortableItemProps) {
  const { id, children } = props
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isReady, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <div className="border p-2 rounded-sm shadow flex items-center gap-2 bg-white" ref={setNodeRef} style={style}>
      <span
        className="hidden md:flex items-center justify-center px-1 cursor-grab text-2xl text-gray-500 hover:text-gray-700"
        aria-label="Drag to reorder"
        {...(isReady ? listeners : {})}
        {...(isReady ? attributes : {})}
      >
        ☰
      </span>
      {children}
    </div>
  )
}
