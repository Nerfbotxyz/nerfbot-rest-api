import { Upload } from '@aws-sdk/lib-storage'
import { PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { injectable } from 'inversify'

@injectable()
export default class S3Adapter {
  client!: S3Client

  constructor() {
    this.client = new S3Client({})
  }

  async upload(params: PutObjectCommandInput) {
    const upload = new Upload({ client: this.client, params })

    upload.on('httpUploadProgress', progress => {
      // console.log('s3 upload progress', progress)
    })

    await upload.done()
  }
}
