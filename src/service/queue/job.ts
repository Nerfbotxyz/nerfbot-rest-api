import { Queue } from 'bull'
import { inject, injectable } from 'inversify'

import { Job } from '~/core'
import { BullAdapter } from '~/infra/queue/adapter'

@injectable()
export default class JobQueue {
  queue!: Queue<Job>

  constructor(@inject('BullAdapter') protected queueAdapter: BullAdapter) {
    this.queue = queueAdapter.get('jobs')
  }

  async add(job: Job) {
    return await this.queue.add(job, { jobId: job.id })
  }
}
