import { injectable } from 'inversify'

import BaseRepository from './base'

export interface Upload {
  userId: number
  apiKey: string
  uploadId: string
}

@injectable()
export default class UploadsRepository extends BaseRepository<Upload> {
  tableName: string = 'uploads'

  async create(upload: Upload): Promise<string> {
    return await this.table.insert(upload).returning('uploadId')
  }
}
