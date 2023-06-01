import { injectable } from 'inversify'

import BaseRepository from './base'

export interface ApiKey {
  apiKeyId: number
  apiKey: string
  userId: number
  label?: string
}

@injectable()
export default class ApiKeysRepository extends BaseRepository<ApiKey> {
  tableName: string = 'api_keys'

  async create(apiKey: Omit<ApiKey, 'apiKeyId' | 'apiKey'>): Promise<ApiKey> {
    const [ newApiKey ] = await this.table.insert(apiKey).returning('*')

    return newApiKey
  }
}
