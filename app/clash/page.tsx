import { getClashRules } from '@/app/api/clash/rule'
import { guid } from '@/utils/guid'
import RuleManager from './RuleManager'
import { checkAccess } from '@/services/auth/access'

export default async function Clash() {
  await checkAccess()

  const { rules, actions } = await getClashRules()
  const rulesWithId = rules.map((rule) => ({ ...rule, id: guid() }))

  return (
    <div className="p-2 md:p-4 max-w-6xl w-full mx-auto mt-12">
      <h1 className="text-2xl text-center font-bold mb-8">Clash Rules Editor</h1>

      <div className="mb-4">
        <RuleManager rules={rulesWithId} actions={actions} />
      </div>
    </div>
  )
}
