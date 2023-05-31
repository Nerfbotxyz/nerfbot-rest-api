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
  trainingId: string
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
