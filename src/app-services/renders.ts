import { inject, injectable } from 'inversify'

import { IAppService } from './'
import { REPOSITORIES, Render, RendersRepository } from '~/service/repository'
import { S3Adapter } from '~/infra/bucket/adapter'
import { AppConfig } from '~/inversify.config'

@injectable()
export default class RendersAppService implements IAppService {
  constructor(
    @inject(REPOSITORIES.RendersRepository)
    private rendersRepository: RendersRepository,
    @inject('S3Adapter') private s3: S3Adapter,
    @inject('AppConfig') private config: AppConfig
  ) {}

  async get(apiKey: string, renderId: string): Promise<Render | null> {
    return await this.rendersRepository.first({ apiKey, renderId })
  }

  async list(apiKey: string): Promise<Render[]> {
    return await this.rendersRepository.list({ apiKey })
  }

  async getDownloadStream(apiKey: string, renderId: string) {
    const render = await this.get(apiKey, renderId)

    if (render) {
      return await this.s3.getObjectStream(
        this.config.s3.renders,
        `${renderId}/render.mp4`
      )
    }

    return null
  }
}
