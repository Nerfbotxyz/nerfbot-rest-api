import { injectable } from 'inversify'

import { Job } from '~/core'
import BaseRepository from './base'

@injectable()
export default class JobRepository
  extends BaseRepository<Job>
{
  tableName: string = 'jobs'

  async create(job: Omit<Job, 'id' | 'status'>): Promise<Job> {
    const [ newJob ] = await this.table
      .insert(job)
      .returning('*')

    return newJob
  }
}
