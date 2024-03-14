import { injectable } from 'inversify'
import { Storage } from '@google-cloud/storage'

import Logger from '~/util/logger'
import {
  CloudBucketAdapter,
  CloudBucketPutObjectArgs,
  ObjectStreamContainer
} from './adapter'

@injectable()
export default class GoogleBucketAdapter implements CloudBucketAdapter {
  client!: Storage
  private logger: Logger = new Logger('GoogleBucketAdapter')

  constructor() {
    this.client = new Storage()
  }

  async testConnection(bucket: string): Promise<void> {
    const [exists] = await this.client.bucket(bucket).exists()
    if (!exists) {
      throw new Error(`Could not connect to cloud bucket: ${bucket}`)
    }
  }

  async putObject(args: CloudBucketPutObjectArgs): Promise<void> {
    await this.client.bucket(args.Bucket).file(args.Key).save(args.Body)
  }

  async getObjectStream(
    Bucket: string,
    Key: string
  ): Promise<ObjectStreamContainer> {
    const file = this.client.bucket(Bucket).file(Key)

    const [ metadata ] = await file.getMetadata()
    const ContentLength = metadata.size
    const Body = file.createReadStream()

    this.logger.log('Key', Key, 'ContentLength', ContentLength)

    return { Body, ContentLength, Key }
  }

  async getObjectStreams(
    bucket: string,
    prefix: string
  ): Promise<ObjectStreamContainer[]> {
    const [ files ] = await this.client.bucket(bucket).getFiles({ prefix })

    return files.map(file => {
      return {
        Key: file.name,
        ContentLength: file.metadata.size,
        Body: file.createReadStream()
      }
    })
  }
}
