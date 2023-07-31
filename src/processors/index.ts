import { CallbackJob, JobType } from '~/core'
import { JobsRepository } from '~/service/repository'

export type JobProcessor<JT extends JobType, JobResult = any> =
  (job: CallbackJob<JT>) => Promise<JobResult>

export const PROCESSORS = {
  CallbacksProcessor: Symbol.for('CallbacksProcessor')
}

export { default as CallbacksProcessor } from './callbacks'
export * from './callbacks'
