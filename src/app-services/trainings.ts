import { inject, injectable } from 'inversify'

import { IAppService } from './'
import {
  Training,
  TrainingsRepository,
  REPOSITORIES
} from '~/service/repository'

@injectable()
export default class TrainingsAppService implements IAppService {
  constructor(
    @inject(REPOSITORIES.TrainingsRepository)
    private trainingsRepository: TrainingsRepository
  ) {}

  async get(apiKey: string, trainingId: string): Promise<Training | null> {
    return await this.trainingsRepository.first({ apiKey, trainingId })
  }

  async list(apiKey: string): Promise<Training[]> {
    return await this.trainingsRepository.list({ apiKey })
  }
}
