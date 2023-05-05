import { injectable } from 'inversify'

import BaseRepository from './base'

export interface Training {
  userId: number
  apiKey: string
  uploadId: string
  processedId: string
  trainingId: string
}

@injectable()
export default class TrainingsRepository extends BaseRepository<Training> {
  tableName: string = 'trainings'

  async create(training: Training): Promise<string> {
    return await this.table.insert(training).returning('trainingId')
  }
}
