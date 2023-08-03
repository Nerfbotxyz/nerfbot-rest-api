import { Upload } from '@aws-sdk/lib-storage'
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { SdkStream } from '@aws-sdk/types/dist-types/serde'
import { injectable } from 'inversify'
import { Readable } from 'stream'

import Logger from '~/util/logger'

export type S3StreamContainer = {
  Key: string,
  ContentLength?: number
  Body?: SdkStream<Readable | ReadableStream | Blob | undefined>
}

@injectable()
export default class S3Adapter {
  client!: S3Client
  private logger: Logger = new Logger('S3Adapter')

  constructor() {
    this.client = new S3Client({})
  }

  async testConnection(Bucket: string) {
    await this.client.send(new ListObjectsV2Command({ Bucket }))
  }

  async upload(params: PutObjectCommandInput) {
    const upload = new Upload({ client: this.client, params })

    // upload.on('httpUploadProgress', progress => {
    //   console.log('s3 upload progress', progress)
    // })

    await upload.done()
  }

  async getObjectStream(
    Bucket: string,
    Key: string
  ): Promise<S3StreamContainer> {
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
  ): Promise<S3StreamContainer[] | null> {
    const { Contents } = await this.client.send(new ListObjectsV2Command({
      Bucket, Prefix
    }))

    if (Contents) {
      const getCommands = Contents
        .map(({ Key }) => Key)
        .filter<string>((Key): Key is string => !!Key)
        .map(
          Key =>
            new Promise<S3StreamContainer>(
              async resolve => {
                const { Body, ContentLength } = await this.client.send(
                  new GetObjectCommand({ Bucket, Key })
                )
                resolve({ Key, Body, ContentLength })
              }
            )
        )
      
      // const objects =
      return await Promise.all(getCommands)

      // return objects
      //   .map(({ Key, obj }) => { return { Key, stream: obj.Body } })
      //   .filter<S3StreamContainer>(
      //     (s): s is S3StreamContainer => !!s
      //   )
    }

    return null
  }
}
