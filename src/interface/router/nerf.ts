import Router from '@koa/router'
import {  } from '../../app'

import { Context, ParameterizedContext, State } from '../../app'
import {
  ProcessRequestsApplicationService,
  UploadsApplicationService
} from '../../app-services'
import { ApiKeyRepository } from '../../service/repository'
import { requireApiToken } from '../middleware'

const MAX_UPLOAD_SIZE_BYTES = 5000000 // 5mb

export class NerfRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    private apiKeys: ApiKeyRepository,
    private uploadsAppService: UploadsApplicationService,
    private processRequestsApplicationService: ProcessRequestsApplicationService
  ) {
    this.build()
  }

  private build() {
    this.router.use(requireApiToken(this.apiKeys))
    this.router.post('/uploads', this.upload.bind(this))
    this.router.get('/uploads', this.getUploads.bind(this))
    this.router.post('/process/:uploadId', this.process.bind(this))
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
      console.error('[NerfRouter][POST][uploads]', error)
      ctx.status = 500
    }
  }

  private async getUploads(ctx: ParameterizedContext) {
    try {
      const uploads = await this.uploadsAppService.getUploadsForApiKey(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { uploads }
    } catch (error) {
      console.error('[NerfRouter][GET][uploads]', error)
      ctx.status = 500
    }
  }

  private async process(ctx: ParameterizedContext) {
    try {
      const processRequest = await this.processRequestsApplicationService
        .create(
          ctx.state.auth!.userId,
          ctx.state.auth!.apiKey,
          ctx.params.uploadId
        )

      ctx.status = 200
      ctx.body = processRequest
    } catch (error) {
      console.error('[NerfRouter][POST][process]', error)
      ctx.status = 500
    }
  }
}
