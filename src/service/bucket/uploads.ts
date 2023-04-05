import { IncomingMessage } from 'http'
import busboy from 'busboy'
import { inject, injectable } from 'inversify'

import { S3Adapter } from '~/infra/bucket/adapter'
import { AppConfig } from '~/inversify.config'
import { IBucketService } from './'

@injectable()
export default class UploadsBucketService implements IBucketService {
  bucket: string

  constructor(
    @inject('S3Adapter') private adapter: S3Adapter,
    @inject('AppConfig') private config: AppConfig
  ) {
    this.bucket = this.config.s3.bucket
  }

  async upload(id: string, req: IncomingMessage) {
    return new Promise<string>(async (resolve, reject) => {
      const bus = busboy({
        headers: req.headers,
        limits: { fileSize: 5e6 } // 5mb TODO -> configurable
      })

      bus.on('file', async (name, stream, { filename, mimeType }) => {
        await this.adapter.upload({
          Bucket: this.bucket,
          Key: `${id}/${filename}`,
          Body: stream,
          ContentType: mimeType
        })
      })

      bus.once('close', () => {
        bus.removeAllListeners()
        resolve(id)
      })

      bus.once('error', (error) => {
        bus.removeAllListeners()
        reject(error)
      })

      req.pipe(bus)
    })
  }
}
