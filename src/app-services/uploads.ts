import { IncomingMessage } from 'http'
import { v4 as uuidv4 } from 'uuid'

import { UploadsBucket } from '../service/bucket'
import { Upload, UploadsRepository } from '../service/repository'

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
    const uploadId = uuidv4()

    await this.uploadsBucket.upload(uploadId, req)
    await this.uploadsRepository.create({ userId, apiKey, uploadId })

    return uploadId
  }

  async list(apiKey: string): Promise<Upload[]> {
    return await this.uploadsRepository.list({ apiKey })
  }

  async get(apiKey: string, uploadId: string): Promise<Upload | null> {
    return await this.uploadsRepository.first({ apiKey, uploadId })
  }
}
