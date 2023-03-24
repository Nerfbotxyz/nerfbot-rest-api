import Router from '@koa/router'
import {  } from '../../app'

import { Context, ParameterizedContext, State } from '../../app'
import {
  ProcessRequestsAppService,
  UploadsApplicationService
} from '../../app-services'
import { ApiKeysRepository } from '../../service/repository'
import { requireApiToken } from '../middleware'

const MAX_UPLOAD_SIZE_BYTES = 5000000 // 5mb

export class NerfRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    private apiKeys: ApiKeysRepository,
    private uploadsAppService: UploadsApplicationService,
    private processRequestsAppService: ProcessRequestsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.use(requireApiToken(this.apiKeys))
    this.router.post('/uploads', this.upload.bind(this))
    this.router.get('/uploads', this.listUploads.bind(this))
    this.router.post('/uploads/:uploadId/process', this.process.bind(this))
    this.router.get('/process-requests', this.listProcessRequests.bind(this))
    this.router.get(
      '/process-requests/:processRequestId',
      this.getProcessRequest.bind(this)
    )
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

      return
    } catch (error) {
      console.error('[NerfRouter][POST][uploads]', error)
      ctx.status = 500

      return
    }
  }

  private async listUploads(ctx: ParameterizedContext) {
    try {
      const uploads = await this.uploadsAppService.listUploadsForApiKey(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { uploads }

      return
    } catch (error) {
      console.error('[NerfRouter][GET][uploads]', error)
      ctx.status = 500

      return
    }
  }

  private async process(ctx: ParameterizedContext) {
    try {
      const processRequest = await this.processRequestsAppService.create(
        ctx.state.auth!.userId,
        ctx.state.auth!.apiKey,
        ctx.params.uploadId
      )

      ctx.status = 200
      ctx.body = processRequest

      return
    } catch (error) {
      console.error('[NerfRouter][POST][process]', error)
      ctx.status = 500

      return
    }
  }

  private async listProcessRequests(ctx: ParameterizedContext) {
    try {
      const processRequests = await this.processRequestsAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { processRequests }

      return
    } catch (error) {
      console.error('[NerfRouter][GET][listProcessRequests]', error)
      ctx.status = 500
    }
  }

  private async getProcessRequest(ctx: ParameterizedContext) {
    try {
      const processRequest = await this.processRequestsAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.processRequestId
      )

      ctx.status = 200
      ctx.body = processRequest

      return
    } catch (error) {
      console.error('[NerfRouter][GET][getProcessRequest]', error)
      ctx.status = 500
    }
  }
}
