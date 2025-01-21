import { checkUnAccess } from '@/services/auth/access'
import LoginForm from './Form'

export default async function LoginPage() {
  await checkUnAccess()
  return <LoginForm />
}
