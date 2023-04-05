import { Queue } from 'bull'
import { inject, injectable } from 'inversify'

import { ProcessRequest } from '~/core'
import { BullAdapter } from '~/infra/queue/adapter'

@injectable()
export default class ProcessQueue {
  queue!: Queue<ProcessRequest>

  constructor(@inject('BullAdapter') protected adapter: BullAdapter) {
    this.queue = adapter.get('process')
  }

  async add(processRequest: ProcessRequest) {
    return await this.queue.add(processRequest)
  }
}
