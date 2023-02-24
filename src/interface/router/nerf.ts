import Router from '@koa/router'
import {  } from '../../app'

import { Context, ParameterizedContext, State } from '../../app'
import { UploadsApplicationService } from '../../app-services'
import { ApiKeyRepository } from '../../service/repository'
import { requireApiToken } from '../middleware'

const MAX_UPLOAD_SIZE_BYTES = 5000000 // 5mb

export class NerfRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    private apiKeys: ApiKeyRepository,
    private uploadsAppService: UploadsApplicationService
  ) {
    this.build()
  }

  private build() {
    this.router.use(requireApiToken(this.apiKeys))
    this.router.post('/upload', this.upload.bind(this))
  }

  private async upload(ctx: ParameterizedContext) {
    try {
      if (!ctx.headers['content-length']) {
        ctx.status = 411 // HTTP 411 Length Required

        return
      }

      const contentLength = Number.parseInt(ctx.headers['content-length'])
      if (
        Number.isInteger(contentLength)
        && contentLength > MAX_UPLOAD_SIZE_BYTES
      ) {
        ctx.status = 413 // HTTP 413 Content Too Large

        return
      }

      const id = await this.uploadsAppService.upload(
        ctx.state.auth!.userId,
        ctx.state.auth!.apiKey,
        ctx.req
      )

      ctx.status = 200
      ctx.body = { id }
    } catch (error) {
      console.error('[NerfRouter][upload]', error)
      ctx.status = 500
    }
  }
}
