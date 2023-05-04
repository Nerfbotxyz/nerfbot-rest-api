export interface IBucketService {
  bucket: string
}

export const BUCKETS = {
  UploadsBucket: Symbol.for('UploadsBucket')
}

export { default as UploadsBucket } from './uploads'
