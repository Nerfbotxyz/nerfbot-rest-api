import { inject, injectable } from 'inversify'

import { IAppService } from './'
import {
  Processed,
  ProcessedRepository,
  REPOSITORIES
} from '~/service/repository'

@injectable()
export default class ProcessedAppService implements IAppService {
  constructor(
    @inject(REPOSITORIES.ProcessedRepository)
    private processedRepository: ProcessedRepository
  ) {}

  async get(apiKey: string, processedId: string): Promise<Processed | null> {
    return await this.processedRepository.first({ apiKey, processedId })
  }

  async list(apiKey: string): Promise<Processed[]> {
    return await this.processedRepository.list({ apiKey })
  }
}
