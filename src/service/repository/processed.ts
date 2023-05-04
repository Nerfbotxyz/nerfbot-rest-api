import { injectable } from 'inversify'

import BaseRepository from './base'

export interface Processed {
  userId: number
  apiKey: string
  uploadId: string
  processedId: string
}

@injectable()
export default class ProcessedRepository extends BaseRepository<Processed> {
  tableName: string = 'processed'

  async create(processed: Processed): Promise<string> {
    return await this.table.insert(processed).returning('processedId')
  }
}
