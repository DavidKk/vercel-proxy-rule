'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequest } from 'ahooks'
import Alert from '@/components/Alert'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const { run: submit, loading: submitting } = useRequest(
    async () => {
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid username or password')
      }
    },
    {
      manual: true,
      onSuccess: () => {
        router.push('/')
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    }
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submit()
  }

  return (
    <div className="flex justify-center pt-[20vh] h-screen bg-gray-100 pt-12">
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col items-center gap-4 p-4">
        <h1 className="text-2xl">Login</h1>

        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full max-w-lg border px-2 py-1 rounded" />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full max-w-lg border px-2 py-1 rounded"
        />

        <button disabled={submitting} type="submit" className="w-full max-w-lg bg-blue-500 text-white px-4 py-2 disable:opacity-100 rounded">
          Login
        </button>

        {errorMessage && <Alert type="error" message={errorMessage} onClear={() => setErrorMessage('')} />}
      </form>
    </div>
  )
}
