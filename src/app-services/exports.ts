import { inject, injectable } from 'inversify'
import archiver from 'archiver'
import { constants } from 'zlib'
import { PassThrough } from 'stream'

import { IAppService } from './'
import {
  ExportsRepository,
  NerfExport,
  REPOSITORIES
} from '~/service/repository'
import { S3Adapter } from '~/infra/bucket/adapter'
import { AppConfig } from '~/inversify.config'

@injectable()
export default class ExportsAppService implements IAppService {
  constructor(
    @inject(REPOSITORIES.ExportsRepository)
    private exportsRepository: ExportsRepository,
    @inject('S3Adapter') private s3: S3Adapter,
    @inject('AppConfig') private config: AppConfig
  ) {}

  async get(apiKey: string, exportId: string): Promise<NerfExport | null> {
    return await this.exportsRepository.first({ apiKey, exportId })
  }

  async list(apiKey: string): Promise<NerfExport[]> {
    return await this.exportsRepository.list({ apiKey })
  }

  async getDownloadStream(apiKey: string, exportId: string) {
    const theExport = await this.get(apiKey, exportId)
    if (!theExport) { return null }
    const streamContainers = await this.s3.getObjectStreams(
      this.config.s3.exports,
      `${exportId}`
    )
    if (!streamContainers) { return null }

    const zipper = archiver('zip', { zlib: { level: constants.Z_BEST_SPEED } })
    const zipStream = new PassThrough()
    zipper.pipe(zipStream)

    streamContainers.forEach(({ Key, Body }) => {
      zipper.append(
        // @ts-ignore - the AWS SDK only includes types for browser streams
        Body,
        { name: Key.replace(`${exportId}/`, '') }
      )
    })

    zipper.finalize()

    return zipStream
  }
}
