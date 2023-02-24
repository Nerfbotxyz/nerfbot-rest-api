import { IncomingMessage } from 'http'
import busboy from 'busboy'

import { S3Adapter } from '../../infra/bucket/adapter'

export default class UploadsBucketService {
  constructor(private adapter: S3Adapter, private bucket: string) {}

  async upload(id: string, req: IncomingMessage) {
    return new Promise<string>(async (resolve, reject) => {
      const bus = busboy({
        headers: req.headers,
        limits: { fileSize: 5000000 } // 5mb
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
