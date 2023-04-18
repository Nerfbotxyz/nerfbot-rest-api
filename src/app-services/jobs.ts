import { inject, injectable } from 'inversify'
import { JobQueue, QUEUES } from '~/service/queue'
import { JobsRepository, REPOSITORIES } from '~/service/repository'

@injectable()
export default class JobsAppService {
  constructor(
    @inject(QUEUES.JobQueue) private jobQueue: JobQueue,
    @inject(REPOSITORIES.JobsRepository) private jobsRepository: JobsRepository
  ) {}

  async createProcessJob(userId: number, apiKey: string, uploadId: string) {
    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'process',
      jobData: { uploadId }
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
