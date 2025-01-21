import { checkAccess } from '@/services/auth/access'
import { Clash } from './clash'

export default async function Home() {
  await checkAccess()
  return <Clash />
}
