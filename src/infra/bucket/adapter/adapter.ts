import { SdkStream } from '@aws-sdk/types/dist-types/serde'
import { Readable } from 'stream'

export interface ObjectStreamContainer {
  Key: string
  ContentLength?: number | string
  Body?: Readable | SdkStream<Readable | ReadableStream | Blob | undefined>
}

export interface CloudBucketPutObjectArgs {
  Bucket: string
  Key: string
  Body: string | Buffer | Readable
  ContentType?: string
}

export interface CloudBucketAdapter {
  testConnection(bucket: string): Promise<void>
  putObject(args: CloudBucketPutObjectArgs): Promise<void>
  getObjectStream(bucket: string, key: string): Promise<ObjectStreamContainer>
  getObjectStreams(
    bucket: string,
    prefix: string
  ): Promise<ObjectStreamContainer[]>
}
