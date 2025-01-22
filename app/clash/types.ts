import type { ClashRule as ClashRuleModel } from '@/services/clash/types'

export type ClashRule = ClashRuleModel & { id: string }
