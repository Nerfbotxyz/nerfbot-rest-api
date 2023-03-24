import BaseRepository from './base'

export interface ApiKey {
  apiKeyId: number
  apiKey: string
  userId: number
}

export default class ApiKeysRepository extends BaseRepository<ApiKey> {
  protected tableName: string = 'api_keys'
}
