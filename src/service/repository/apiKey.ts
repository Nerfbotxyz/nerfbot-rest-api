import BaseRepository from './base'

export interface ApiKey {
  apiKeyId: number
  apiKey: string
  userId: number
}

export default class ApiKeyRepository extends BaseRepository<ApiKey> {
  protected tableName: string = 'api_keys'

  async first(column: string, value: string | number): Promise<ApiKey | null> {
    return await this.table
      .where(column, value)
      .first<ApiKey | undefined>() || null
  }
}
