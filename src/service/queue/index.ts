export interface IQueueService {}

export const QUEUES = {
  ProcessQueue: Symbol.for('ProcessQueue')
}

export { default as ProcessQueue } from './process'
