import Bull, { Queue } from 'bull'
import { inject, injectable } from 'inversify'

import { BullAdapter } from '~/infra/queue/adapter'
import { Job } from '~/core'
import { IQueueService } from './'

@injectable()
export default class JobsQueue implements IQueueService {
  queue!: Queue<Job<any>>

  constructor(@inject('BullAdapter') protected queueAdapter: BullAdapter) {
    this.queue = queueAdapter.get('jobs')
  }

  async add(job: Job<any>) {
    return await this.queue.add(job, { jobId: job.id })
  }

  onCompleted(callback: Bull.CompletedEventCallback<Job<any>>) {
    this.queue.on('completed', callback)
  }

  onFailed(callback: Bull.FailedEventCallback<Job<any>>) {
    this.queue.on('failed', callback)
  }

  get pendingListenersCount(): number {
    const completed = this.queue.listenerCount('completed')
    const failed = this.queue.listenerCount('failed')

    return completed + failed
  }
}
