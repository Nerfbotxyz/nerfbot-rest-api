export interface IQueueService {}

export const QUEUES = {
  JobsQueue: Symbol.for('JobsQueue'),
  CallbacksQueue: Symbol.for('CallbacksQueue')
}

export { default as JobsQueue } from './jobs'
export { default as CallbacksQueue } from './callbacks'
