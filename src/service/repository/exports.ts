import { injectable } from 'inversify'

import BaseRepository from './base'

export interface NerfExport {
  userId: number
  apiKey: string
  uploadId: string
  processedId: string
  trainingId: string
  exportId: string
}

@injectable()
export default class ExportsRepository extends BaseRepository<NerfExport> {
  tableName: string = 'exports'

  async create(nerfExport: NerfExport): Promise<string> {
    return await this.table.insert(nerfExport).returning('exportId')
  }
}
