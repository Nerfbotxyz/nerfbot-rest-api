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

@injectable()
export default class S3Adapter {
  client!: S3Client

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

  async getObjectStream(Bucket: string, Key: string) {
    const obj = await this.client.send(new GetObjectCommand({ Bucket, Key }))

    return obj.Body
  }

  async getObjectStreams(Bucket: string, Prefix: string) {
    const { Contents } = await this.client.send(new ListObjectsV2Command({
      Bucket, Prefix
    }))

    if (Contents) {
      const getCommands = Contents
        .map(({ Key }) => Key)
        .filter<string>((Key): Key is string => !!Key)
        .map(
          Key =>
            new Promise<{ Key: string, obj: GetObjectCommandOutput }>(
              async resolve =>
                resolve({
                  Key,
                  obj: await this.client.send(
                    new GetObjectCommand({ Bucket, Key })
                  )
                })
            )
        )
      
      const objects = await Promise.all(getCommands)

      return objects
        .map(({ Key, obj }) => { return { Key, stream: obj.Body } })
        .filter<{ Key: string, stream: SdkStream<Readable | ReadableStream | Blob> }>(
          (s): s is { Key: string, stream: SdkStream<Readable | ReadableStream | Blob> } => !!s
        )
    }

    return null
  }
}
