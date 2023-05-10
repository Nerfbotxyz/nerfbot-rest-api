import { inject, injectable } from 'inversify'

import { IAppService } from './'
import { REPOSITORIES, Render, RendersRepository } from '~/service/repository'

@injectable()
export default class RendersAppService implements IAppService {
  constructor(
    @inject(REPOSITORIES.RendersRepository)
    private rendersRepository: RendersRepository
  ) {}

  async get(apiKey: string, renderId: string): Promise<Render | null> {
    return await this.rendersRepository.first({ apiKey, renderId })
  }

  async list(apiKey: string): Promise<Render[]> {
    return await this.rendersRepository.list({ apiKey })
  }
}
