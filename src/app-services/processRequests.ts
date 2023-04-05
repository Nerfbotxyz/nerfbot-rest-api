import { inject, injectable } from 'inversify'
import { ProcessQueue, QUEUES } from '~/service/queue'
import { ProcessRequestsRepository } from '~/service/repository'

@injectable()
export default class ProcessRequestsAppService {
  constructor(
    @inject(QUEUES.ProcessQueue) private processQueue: ProcessQueue
  ) {}

  async create(userId: number, apiKey: string, uploadId: string) {
    // TODO -> instead, create job in postgres then add to queue and return
    const job = await this.processQueue.add({ userId, apiKey, uploadId })

    const jobJSON = job.toJSON()

    console.log('process job created', jobJSON)

    return jobJSON

    // return await this.processRequests.create({
    //   userId,
    //   apiKey,
    //   uploadId
    // })
  }

  async get(apiKey: string, jobId: string) {
    // TODO -> gate by api key

    // return await this.processRequests.first({ apiKey, processRequestId })
  }

  async list(apiKey: string) {
    // TODO

    // return await this.processRequests.list({ apiKey })
  }
}
