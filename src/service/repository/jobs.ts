import { injectable } from 'inversify'

import { Job } from '~/core'
import BaseRepository from './base'

@injectable()
export default class JobRepository
  extends BaseRepository<Job<any>>
{
  tableName: string = 'jobs'

  async create(job: Omit<Job<any>, 'id' | 'status'>): Promise<Job<any>> {
    const [ newJob ] = await this.table
      .insert(job)
      .returning('*')

    return newJob
  }
}
