export type JobStatus = 'WAITING' | 'PROCESSING' | 'ERROR' | 'COMPLETE'

export type NsProcessMediaType =
  | 'images'
  | 'video'
  | 'polycam'
  | 'metashape'
  | 'realitycapture'
  | 'record3d'

export interface ProcessJobData {
  uploadId: string,
  mediaType: NsProcessMediaType
}

export interface TrainingJobData {
  processedId: string
}

export interface RenderJobData {
  trainingId: string,
  renderType?:  'orbital' | 'interpolate' | 'spiral',
  orbitalRadius?: 1 | 0.5 | 1.5
}

export interface ExportJobData {
  trainingId: string
}

export type JobType =
  | ProcessJobData
  | TrainingJobData
  | RenderJobData
  | ExportJobData

export default interface Job<T extends JobType> {
  id: string
  userId: number
  apiKey: string
  status: JobStatus
  jobName: string
  jobData: T
}
