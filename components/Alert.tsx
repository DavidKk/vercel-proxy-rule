'use client'

import { useEffect, useState } from 'react'
import { useInterval } from 'ahooks'

export interface AlertProps {
  type?: 'success' | 'error'
  message: string
  onClear: () => void
  duration?: number
}

export default function Alert(props: AlertProps) {
  const { type = 'success', message, onClear, duration = 4 } = props
  const [count = 1000, setCount] = useState(duration)

  const clearInterval = useInterval(() => {
    setCount((count) => count - 1)
  }, 1e3)

  useEffect(() => {
    if (count <= 0) {
      clearInterval()
      onClear()
    }
  }, [count])

  return (
    <div
      className={`w-full flex px-3 py-2 text-sm text-white bg-${type === 'success' ? 'green' : 'red'}-500 rounded-sm opacity-100 animate-fade-out`}
      style={{ animationDelay: '3s' }}
    >
      {message} <span className="ml-auto">{count}s</span>
    </div>
  )
}
