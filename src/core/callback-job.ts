import { Job, JobStatus, JobType } from './'

export default interface CallbackJob<JobData extends JobType>
  extends Job<JobData>
{
  status: Exclude<JobStatus, 'WAITING' | 'PROCESSING'>
  jobData: { callbackURL: string } & JobData
}
