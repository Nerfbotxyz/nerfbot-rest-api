import { IncomingMessage } from 'http'
import busboy from 'busboy'
import { inject, injectable } from 'inversify'
import mime from 'mime'

import { S3Adapter } from '~/infra/bucket/adapter'
import { AppConfig } from '~/inversify.config'
import { IBucketService } from './'
import Logger from '~/util/logger'
import { NsProcessMediaType } from '~/core'

type UploadResult = {
  mediaType: NsProcessMediaType
  filenames: string[]
}

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
    return new Promise<UploadResult>(async (resolve, reject) => {
      const uploadStreams: Promise<void>[] = []
      const filenamesAndMimetypes: { filename: string, mimeType: string }[] = []

      try {
        const bus = busboy({
          headers: req.headers,
          limits: { fileSize: 5e8 } // 500mb TODO -> configurable
        })

        bus.on('file', async (name, stream, { filename }) => {
          const mimeType = mime.getType(filename) || 'application/octet-stream'
          filenamesAndMimetypes.push({ filename, mimeType })
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

          if (filenamesAndMimetypes.length < 1) {
            reject(new Error('No files'))
          } else {
            this.logger.info('Got files and mime types', filenamesAndMimetypes)

            // NB: for now, we only support video and images media types
            const videoOrImage = filenamesAndMimetypes[0].mimeType.split('/')[0]
            const mediaType: NsProcessMediaType = videoOrImage === 'image'
              ? 'images'
              : 'video'
  
            resolve({
              mediaType,
              filenames: filenamesAndMimetypes.map(({ filename }) => filename)
            })
          }
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
