import { inject, injectable } from 'inversify'

import { IAppService } from './'
import {
  ApiKey,
  ApiKeysRepository,
  REPOSITORIES,
  RoleType,
  RolesRepository
} from '~/service/repository'
import Logger from '~/util/logger'

@injectable()
export default class AuthAppService implements IAppService {
  private logger = new Logger('AuthAppService')

  constructor(
    @inject(REPOSITORIES.ApiKeysRepository)
    private apiKeysRepository: ApiKeysRepository,
    @inject(REPOSITORIES.RolesRepository)
    private rolesRepository: RolesRepository
  ) {}

  async createApiKey(
    userId: number,
    apiKey: string,
    label?: string
  ) {
    if (!(await this.hasRole(apiKey, 'CREATE_API_KEY'))) {
      return null
    }

    const newApiKey = await this.apiKeysRepository.create({
      userId, label
    })

    return newApiKey
  }

  async hasRole(apiKey: string, role: RoleType): Promise<boolean> {
    return !!(await this.rolesRepository.first({ apiKey, role }))
  }

  async listApiKeys(userId: number): Promise<ApiKey[]> {
    return await this.apiKeysRepository.list({ userId })
  }
}
