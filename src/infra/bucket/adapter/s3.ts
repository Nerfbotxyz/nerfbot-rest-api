import { Upload } from '@aws-sdk/lib-storage'
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3'

import Logger from '~/util/logger'
import {
  CloudBucketAdapter,
  CloudBucketPutObjectArgs,
  ObjectStreamContainer
} from './adapter'

export default class S3Adapter implements CloudBucketAdapter {
  client!: S3Client
  private logger: Logger = new Logger('S3Adapter')

  constructor() {
    this.client = new S3Client({})
  }

  async testConnection(Bucket: string) {
    await this.client.send(new ListObjectsV2Command({ Bucket }))
  }

  async putObject(params: CloudBucketPutObjectArgs) {
    // const params: PutObjectCommandInput = {}
    const upload = new Upload({ client: this.client, params })

    // upload.on('httpUploadProgress', progress => {
    //   console.log('s3 upload progress', progress)
    // })

    await upload.done()
  }

  async getObjectStream(
    Bucket: string,
    Key: string
  ): Promise<ObjectStreamContainer> {
    const {
      Body,
      ContentLength
    } = await this.client.send(new GetObjectCommand({ Bucket, Key }))

    this.logger.log('Key', Key, 'ContentLength', ContentLength)

    return { Body, ContentLength, Key }
  }

  async getObjectStreams(
    Bucket: string,
    Prefix: string
  ): Promise<ObjectStreamContainer[]> {
    const { Contents } = await this.client.send(new ListObjectsV2Command({
      Bucket, Prefix
    }))

    if (Contents) {
      const getCommands = Contents
        .map(({ Key }) => Key)
        .filter<string>((Key): Key is string => !!Key)
        .map(
          Key =>
            new Promise<ObjectStreamContainer>(
              async resolve => {
                const { Body, ContentLength } = await this.client.send(
                  new GetObjectCommand({ Bucket, Key })
                )
                resolve({ Key, Body, ContentLength })
              }
            )
        )
      
      return await Promise.all(getCommands)
    }

    return []
  }
}
