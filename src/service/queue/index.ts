export interface IQueueService {}

export const QUEUES = {
  JobQueue: Symbol.for('JobQueue')
}

export { default as JobQueue } from './job'
