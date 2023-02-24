import { IncomingMessage } from 'http'
import { v4 as uuidv4 } from 'uuid'

import { UploadsBucket } from '../service/bucket'
import { UploadsRepository } from '../service/repository'

export default class UploadsApplicationService {
  constructor(
    private uploadsBucket: UploadsBucket,
    private uploadsRepository: UploadsRepository
  ) {}

  async upload(
    userId: number,
    apiKey: string,
    req: IncomingMessage
  ): Promise<string> {
    const id = uuidv4()

    await this.uploadsBucket.upload(id, req)
    await this.uploadsRepository.create(userId, apiKey, id)

    return id
  }
}
