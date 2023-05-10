import { injectable } from 'inversify'

import BaseRepository from './base'

export interface Render {
  userId: number
  apiKey: string
  uploadId: string
  processedId: string
  trainingId: string
  renderId: string
}

@injectable()
export default class RendersRepository extends BaseRepository<Render> {
  tableName: string = 'renders'

  async create(training: Render): Promise<string> {
    return await this.table.insert(training).returning('renderId')
  }
}
