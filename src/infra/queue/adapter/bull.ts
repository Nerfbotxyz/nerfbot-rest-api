import Bull from 'bull'
import { injectable } from 'inversify'

@injectable()
export default class BullAdapter {
  constructor(private connection: string) {}

  get<T = any>(queueName: string) {
    return new Bull<T>(queueName, this.connection)
  }
}
