import { injectable } from 'inversify'

import { ProcessRequest } from '~/core'
import BaseRepository from './base'

@injectable()
export default class ProcessRequestsRepository
  extends BaseRepository<ProcessRequest>
{
  tableName: string = 'process_requests'

  async create(
    createProcessRequest: ProcessRequest
  ): Promise<ProcessRequest> {
    const [ newProcessRequest ] = await this.table
      .insert(createProcessRequest)
      .returning('*')

    return newProcessRequest
  }
}
