import { v4 as uuid } from 'uuid'
import { getClashRules } from '@/app/api/clash/rule'
import { GettingStart } from './GettingStart'
import { checkAccess } from '@/services/auth/access'

export default async function ConfigPage() {
  await checkAccess()

  const { actions } = await getClashRules()
  return (
    <div className="p-2 md:p-4 max-w-6xl mx-auto mt-12">
      <h1 className="text-2xl text-center font-bold mb-8">Clash Config</h1>

      <GettingStart secret={uuid()} actions={actions} />
    </div>
  )
}
