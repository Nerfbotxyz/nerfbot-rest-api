import { injectable } from 'inversify'

import BaseRepository from './base'

export interface Render {
  userId: number
  apiKey: string
  uploadId: string
  processedId: string
  trainingId: string
  renderId: string
  label: string
}

@injectable()
export default class RendersRepository extends BaseRepository<Render> {
  tableName: string = 'renders'

  async create(render: Render): Promise<string> {
    return await this.table.insert(render).returning('renderId')
  }
}
