import { injectable } from 'inversify'

import BaseRepository from './base'

export interface ApiKey {
  apiKeyId: number
  apiKey: string
  userId: number
}

@injectable()
export default class ApiKeysRepository extends BaseRepository<ApiKey> {
  tableName: string = 'api_keys'
}
