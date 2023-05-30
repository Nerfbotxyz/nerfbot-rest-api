import { IncomingMessage } from 'http'
import busboy from 'busboy'
import { inject, injectable } from 'inversify'

import { S3Adapter } from '~/infra/bucket/adapter'
import { AppConfig } from '~/inversify.config'
import { IBucketService } from './'
import Logger from '~/util/logger'

@injectable()
export default class UploadsBucketService implements IBucketService {
  private logger: Logger = new Logger('UploadsBucketService')
  bucket: string

  constructor(
    @inject('S3Adapter') private adapter: S3Adapter,
    @inject('AppConfig') private config: AppConfig
  ) {
    this.bucket = this.config.s3.uploads
  }

  async upload(id: string, req: IncomingMessage) {
    return new Promise<string>(async (resolve, reject) => {
      const uploadStreams: Promise<void>[] = []

      try {
        const bus = busboy({
          headers: req.headers,
          limits: { fileSize: 5e8 } // 500mb TODO -> configurable
        })

        bus.on('file', async (name, stream, { filename, mimeType }) => {
          uploadStreams.push(
            this.adapter.upload({
              Bucket: this.bucket,
              Key: `${id}/${filename}`,
              Body: stream,
              ContentType: mimeType
            })
          )
        })

        bus.once('close', async () => {
          bus.removeAllListeners()
          await Promise.all(uploadStreams)
          resolve(id)
        })

        bus.once('error', (error) => {
          bus.removeAllListeners()
          reject(error)
        })

        req.pipe(bus)
      } catch (error) {
        this.logger.error('upload() busboy error', error)
        reject(error)
      }
    })
  }
}
