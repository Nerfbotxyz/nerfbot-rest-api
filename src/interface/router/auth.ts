import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import { ApiKeysRepository, REPOSITORIES } from '~/service/repository'
import { ApiKeyMiddleware, MIDDLEWARES } from '~/interface/middleware'
import { APP_SERVICES, AuthAppService } from '~/app-services'
import Logger from '~/util/logger'

@injectable()
export class AuthRouter {
  router: Router<State, Context> = new Router<State, Context>()
  logger: Logger = new Logger('AuthRouter')

  constructor(
    @inject(REPOSITORIES.ApiKeysRepository) private apiKeys: ApiKeysRepository,
    @inject(MIDDLEWARES.ApiKeyMiddleware)
    private requireApiToken: ApiKeyMiddleware,
    @inject(APP_SERVICES.AuthAppService)
    private authAppService: AuthAppService
  ) {
    this.build()
  }

  private build() {
    this.router.use(this.requireApiToken(this.apiKeys))
    this.router.post('/api-keys', this.createApiKey.bind(this))
    this.router.get('/api-keys', this.listApiKeys.bind(this))
  }

  private async createApiKey(ctx: ParameterizedContext) {
    try {
      const { label } = ctx.request.body as any

      const apiKey = await this.authAppService.createApiKey(
        ctx.state.auth!.userId,
        ctx.state.auth!.apiKey,
        label
      )

      if (apiKey) {
        ctx.status = 200
        ctx.body = apiKey
      } else {
        ctx.status = 401
      }
    } catch (error) {
      this.logger.error('[POST][createApiKey]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[POST][createApiKey]',
      ctx.status,
      ctx.state.auth!.userId,
      ctx.state.auth!.apiKey,
      ctx.request.body
    )

    return
  }

  private async listApiKeys(ctx: ParameterizedContext) {
    try {
      const apiKeys = await this.authAppService.listApiKeys(
        ctx.state.auth!.userId
      )

      ctx.status = 200
      ctx.body = { apiKeys }
    } catch (error) {
      this.logger.error('[GET][listApiKeys]', error)
      ctx.status = 500
    }

    this.logger.info(
      '[GET][listApiKeys]',
      ctx.status,
      ctx.state.auth!.userId,
      ctx.state.auth!.apiKey
    )

    return
  }
}
