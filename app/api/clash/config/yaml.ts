import { CLASH_CONFIG_FILE } from '@/services/clash/constants'
import { getGistInfo, readGistFile } from '@/services/gist'

export function getClashYaml() {
  const { gistId, gistToken } = getGistInfo()
  return readGistFile({ gistId, gistToken, fileName: CLASH_CONFIG_FILE })
}
