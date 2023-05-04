export type JobStatus = 'WAITING' | 'PROCESSING' | 'ERROR' | 'COMPLETE'

export default interface Job {
  id: string
  userId: number
  apiKey: string
  status: JobStatus
  jobName: string
  jobData: any
}


