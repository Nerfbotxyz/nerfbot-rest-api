import { Queue } from 'bull'
import { inject, injectable } from 'inversify'

import { BullAdapter } from '~/infra/queue/adapter'
import { CallbackJob, JobType } from '~/core'
import { JobProcessor, PROCESSORS } from '~/processors'
import { IQueueService } from './'
import { JobsRepository, REPOSITORIES } from '../repository'

@injectable()
export default class CallbacksQueue implements IQueueService {
  queue!: Queue<CallbackJob<any>>

  constructor(
    @inject('BullAdapter') protected queueAdapter: BullAdapter,
    @inject(PROCESSORS.CallbacksProcessor)
    private processor: JobProcessor<JobType>,
    @inject(REPOSITORIES.JobsRepository) 
    protected jobsRepository: JobsRepository
  ) {
    this.queue = queueAdapter.get('callbacks')
  }

  async start() {
    await this.queue.process(
      async job => {
        const dbJob = await this.jobsRepository.first({ id: job.id.toString() })
        if (!dbJob) { return }

        this.processor(dbJob as CallbackJob<JobType>)
      }
    )
  }

  async stop() {
    await this.queue.close()
  }
}
