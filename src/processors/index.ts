export type JobProcessor<JobType, JobResult = any> =
  (job: JobType) => Promise<JobResult>

export const PROCESSORS = {
  CallbacksProcessor: Symbol.for('CallbacksProcessor')
}

export { default as CallbacksProcessor } from './callbacks'
export * from './callbacks'
