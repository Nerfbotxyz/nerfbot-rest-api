import Router from '@koa/router'
import { inject, injectable } from 'inversify'

import { State, Context, ParameterizedContext } from '~/app'
import { IRouter } from '../'
import { APP_SERVICES, JobsAppService } from '~/app-services'

@injectable()
export default class NerfJobsRouter implements IRouter<State, Context> {
  router: Router<State, Context> = new Router<State, Context>()

  constructor(
    @inject(APP_SERVICES.JobsAppService)
    private jobsAppService: JobsAppService
  ) {
    this.build()
  }

  private build() {
    this.router.get('/', this.listJobs.bind(this))
    this.router.get('/:jobId', this.getJob.bind(this))
  }

  private async listJobs(ctx: ParameterizedContext) {
    try {
      const jobs = await this.jobsAppService.list(
        ctx.state.auth!.apiKey
      )

      ctx.status = 200
      ctx.body = { jobs }

      return
    } catch (error) {
      console.error('[NerfRouter][GET][listJobs]', error)
      ctx.status = 500
    }
  }

  private async getJob(ctx: ParameterizedContext) {
    try {
      const processRequest = await this.jobsAppService.get(
        ctx.state.auth!.apiKey,
        ctx.params.jobId
      )

      ctx.status = 200
      ctx.body = processRequest

      return
    } catch (error) {
      console.error('[NerfRouter][GET][getJob]', error)
      ctx.status = 500
    }
  }
}
