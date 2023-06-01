import { IncomingMessage } from 'http'
import { v4 as uuidv4 } from 'uuid'
import { inject, injectable } from 'inversify'

import { BUCKETS, UploadsBucket } from '~/service/bucket'
import { REPOSITORIES, Upload, UploadsRepository } from '~/service/repository'
import { IAppService } from './'

@injectable()
export default class UploadsAppService implements IAppService {
  constructor(
    @inject(BUCKETS.UploadsBucket) private uploadsBucket: UploadsBucket,
    @inject(REPOSITORIES.UploadsRepository)
    private uploadsRepository: UploadsRepository
  ) {}

  async upload(
    userId: number,
    apiKey: string,
    req: IncomingMessage
  ): Promise<string> {
    const uploadId = uuidv4()

    const mediaType = await this.uploadsBucket.upload(uploadId, req)
    await this.uploadsRepository.create({ userId, apiKey, uploadId, mediaType })

    return uploadId
  }

  async list(apiKey: string): Promise<Upload[]> {
    return await this.uploadsRepository.list({ apiKey })
  }

  async get(apiKey: string, uploadId: string): Promise<Upload | null> {
    return await this.uploadsRepository.first({ apiKey, uploadId })
  }
}
