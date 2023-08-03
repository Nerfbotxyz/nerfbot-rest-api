import axios from 'axios'

import { CallbackJob, JobType } from '~/core'
import Logger from '~/util/logger'

const logger = new Logger('CallbacksProcessor')

export default async (job: CallbackJob<JobType>) => {
  const { callbackURL } = job.jobData
  if (!callbackURL) { return }
  
  logger.info(`${job.id} POST ${job.status} job result to ${callbackURL}`)

  try {
    const { status } = await axios.post(callbackURL, job)
    logger.info(`${job.id} POST ${status} ${callbackURL}`)
  } catch (postError) {
    logger.error(`${job.id} POST ERROR ${callbackURL}, postError)`)
  }
}
