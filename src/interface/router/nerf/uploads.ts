import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { Context, ParameterizedContext, State } from '~/app'
import {
  APP_SERVICES,
  ProcessRequestsAppService,
  UploadsAppService
} from '~/app-services'

const MAX_UPLOAD_SIZE_BYTES = 5000000 // 5mb

@injectable()
export default class NerfUploadsRouter {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(APP_SERVICES.UploadsAppService)
    private uploadsAppService: UploadsAppService,
    @inject(APP_SERVICES.ProcessRequestsAppService)
    private processRequestsAppService: ProcessRequestsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.post('/', this.upload.bind(this))
    this.router.get('/', this.listUploads.bind(this))
    this.router.get('/:uploadId', this.getUpload.bind(this))
    this.router.post('/:uploadId/process', this.processUpload.bind(this))
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

  private async getUpload(ctx: ParameterizedContext) {
    try {
      const upload = await this.uploadsAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.uploadId
      )

      ctx.status = 200
      ctx.body = { upload }

      return
    } catch (error) {
      console.error('[NerfRouter][GET][getUpload]', error)
      ctx.status = 500

      return
    }
  }

  private async listUploads(ctx: ParameterizedContext) {
    try {
      const uploads = await this.uploadsAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { uploads }

      return
    } catch (error) {
      console.error('[NerfRouter][GET][listUploads]', error)
      ctx.status = 500

      return
    }
  }

  private async processUpload(ctx: ParameterizedContext) {
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
}
