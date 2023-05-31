import { Queue } from 'bull'
import { inject, injectable } from 'inversify'

import { BullAdapter } from '~/infra/queue/adapter'
import { CallbackJob } from '~/core'
import { JobProcessor, PROCESSORS } from '~/processors'
import { IQueueService } from './'

@injectable()
export default class CallbacksQueue implements IQueueService {
  queue!: Queue<CallbackJob<any>>

  constructor(
    @inject('BullAdapter') protected queueAdapter: BullAdapter,
    @inject(PROCESSORS.CallbacksProcessor)
    private processor: JobProcessor<CallbackJob<any>>
  ) {
    this.queue = queueAdapter.get('callbacks')
  }

  async start() {
    await this.queue.process(job => this.processor.bind(this)(job.data))
  }

  async stop() {
    await this.queue.close()
  }
}
