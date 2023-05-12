import { inject, injectable } from 'inversify'

import { IAppService } from './'
import {
  ExportsRepository,
  NerfExport,
  REPOSITORIES
} from '~/service/repository'

@injectable()
export default class ExportsAppService implements IAppService {
  constructor(
    @inject(REPOSITORIES.ExportsRepository)
    private exportsRepository: ExportsRepository
  ) {}

  async get(apiKey: string, exportId: string): Promise<NerfExport | null> {
    return await this.exportsRepository.first({ apiKey, exportId })
  }

  async list(apiKey: string): Promise<NerfExport[]> {
    return await this.exportsRepository.list({ apiKey })
  }
}
