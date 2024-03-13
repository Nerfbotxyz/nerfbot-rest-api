import { injectable } from 'inversify'
import type { Readable } from 'stream'

import { GoogleBucketAdapter, S3Adapter } from './adapter'
import { CloudBucketPutObjectArgs } from './adapter/adapter'

@injectable()
export default class CloudBucket {
  private adapter!: S3Adapter | GoogleBucketAdapter

  constructor(provider: string) {
    switch (provider) {
      case 'AWS':
        this.adapter = new S3Adapter()
        break
      case 'Google':
        this.adapter = new GoogleBucketAdapter()
        break
      default:
        throw new Error(`Unknown Cloud Bucket provider: ${provider}`)
    }
  }

  async test(bucket: string) {
    return this.adapter.testConnection(bucket)
  }

  async putObject(args: CloudBucketPutObjectArgs) {
    return this.adapter.putObject(args)
  }

  async getObjectStream(bucket: string, key: string) {
    return this.adapter.getObjectStream(bucket, key)
  }

  async getObjectStreams(bucket: string, prefix: string) {
    return this.adapter.getObjectStreams(bucket, prefix)
  }
}
