import { ProcessRequestRepository } from '../service/repository'

export default class ProcessRequestsApplicationService {
  constructor(
    private processRequestsRepository: ProcessRequestRepository
  ) {}

  async create(userId: number, apiKey: string, uploadId: string) {
    return await this.processRequestsRepository.create({
      userId,
      apiKey,
      uploadId
    })
  }

  async get(processRequestId: string) {
    return await this.processRequestsRepository
      .first('processRequestId', processRequestId)
  }
}
