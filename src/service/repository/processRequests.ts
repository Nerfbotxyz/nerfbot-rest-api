import BaseRepository from './base'

export interface ProcessRequest {
  processRequestId: string
  userId: number
  apiKey: string
  uploadId: string
  status: 'WAITING' | 'PROCESSING' | 'ERROR' | 'COMPLETE'
  created_at: Date
  updated_at: Date
}
type OmitProcessRequestProps =
  | 'processRequestId'
  | 'status'
  | 'created_at'
  | 'updated_at'
export type CreateProcessRequest = Omit<ProcessRequest, OmitProcessRequestProps>

export default class ProcessRequestRepository
  extends BaseRepository<ProcessRequest>
{
  protected tableName: string = 'process_requests'

  async create(
    createProcessRequest: CreateProcessRequest
  ): Promise<ProcessRequest> {
    const [ newProcessRequest ] = await this.table
      .insert(createProcessRequest)
      .returning('*')

    return newProcessRequest
  }
}
