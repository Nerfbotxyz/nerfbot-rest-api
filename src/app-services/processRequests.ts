import { ProcessRequestsRepository } from '../service/repository'

export default class ProcessRequestsAppService {
  constructor(
    private processRequests: ProcessRequestsRepository
  ) {}

  async create(userId: number, apiKey: string, uploadId: string) {
    return await this.processRequests.create({
      userId,
      apiKey,
      uploadId
    })
  }

  async get(apiKey: string, processRequestId: string) {
    return await this.processRequests.first({ apiKey, processRequestId })
  }

  async list(apiKey: string) {
    return await this.processRequests.list({ apiKey })
  }
}
