import { inject, injectable } from 'inversify'
import { JobQueue, QUEUES } from '~/service/queue'
import { JobsRepository, REPOSITORIES } from '~/service/repository'

export type NerfProcessDataInputType =
  | 'images'
  | 'video'
  | 'polycam'
  | 'metashape'
  | 'realitycapture'
  | 'record3d'

@injectable()
export default class JobsAppService {
  constructor(
    @inject(QUEUES.JobQueue) private jobQueue: JobQueue,
    @inject(REPOSITORIES.JobsRepository) private jobsRepository: JobsRepository
  ) {}

  async createProcessJob(
    userId: number,
    apiKey: string,
    uploadId: string,
    mediaType: string
  ) {
    // TODO -> validate media type to NerfProcessDataInputType
    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'process',
      jobData: { uploadId, mediaType }
    })

    await this.jobQueue.add(job)

    return job
  }

  async get(apiKey: string, jobId: string) {
    return await this.jobsRepository.first({ apiKey, id: jobId })
  }

  async list(apiKey: string) {
    return await this.jobsRepository.list({ apiKey })
  }
}
