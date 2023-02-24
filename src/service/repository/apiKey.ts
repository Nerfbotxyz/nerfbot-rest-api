import BaseRepository from './base'

export interface ApiKey {
  apiKey: string
  userId: number
}

export default class ApiKeyRepository extends BaseRepository {
  protected tableName: string = 'apiKeys'

  async first(column: string, value: string) {
    return await this.table
      .where(column, value)
      .first<ApiKey | undefined>() || null
  }
}
