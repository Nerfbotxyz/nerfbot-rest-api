import { inject, injectable } from 'inversify'

import { JobsQueue, QUEUES } from '~/service/queue'
import { JobsRepository, REPOSITORIES } from '~/service/repository'
import {
  APP_SERVICES,
  ProcessedAppService,
  TrainingsAppService,
  UploadsAppService
} from './'
import Logger from '~/util/logger'

export type NerfProcessDataInputType =
  | 'images'
  | 'video'
  | 'polycam'
  | 'metashape'
  | 'realitycapture'
  | 'record3d'

const ENABLED_MEDIA_TYPES: NerfProcessDataInputType[] = [ 'images', 'video' ]

export const CALLBACKS_EMPTY = 'callbacks-empty'

@injectable()
export default class JobsAppService {
  private logger: Logger = new Logger('JobsAppService')

  constructor(
    @inject(QUEUES.JobsQueue) private jobQueue: JobsQueue,
    @inject(REPOSITORIES.JobsRepository)
    private jobsRepository: JobsRepository,
    @inject(APP_SERVICES.UploadsAppService)
    private uploadsAppService: UploadsAppService,
    @inject(APP_SERVICES.ProcessedAppService)
    private processedAppService: ProcessedAppService,
    @inject(APP_SERVICES.TrainingsAppService)
    private trainingsAppService: TrainingsAppService
  ) {}

  async createProcessJob(
    userId: number,
    apiKey: string,
    uploadId: string,
    mediaType: string,
    callbackURL?: string
  ) {
    this.logger.info(
      'createProcessJob',
      { apiKey, uploadId, mediaType, callbackURL }
    )
    const upload = await this.uploadsAppService.get(apiKey, uploadId)
    if (!upload) { return null }
    if (!ENABLED_MEDIA_TYPES.includes(mediaType as NerfProcessDataInputType)) {
      return Error('Unsupported mediaType')
    }

    const jobData: any = { uploadId: upload.uploadId, mediaType }

    if (callbackURL) {
      jobData.callbackURL = callbackURL
    }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'process',
      jobData
    })

    await this.jobQueue.add(job)

    return job
  }

  async createTrainingJob(
    userId: number,
    apiKey: string,
    processedId: string
  ) {
    const processed = await this.processedAppService.get(apiKey, processedId)
    if (!processed) { return null }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'train',
      jobData: { processedId: processed.processedId }
    })

    await this.jobQueue.add(job)

    return job
  }

  async createRenderJob(
    userId: number,
    apiKey: string,
    trainingId: string
  ) {
    const training = await this.trainingsAppService.get(apiKey, trainingId)
    if (!training) { return null }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'render',
      jobData: { trainingId: training.trainingId }
    })

    await this.jobQueue.add(job)

    return job
  }

  async createExportJob(
    userId: number,
    apiKey: string,
    trainingId: string
  ) {
    const training = await this.trainingsAppService.get(apiKey, trainingId)
    if (!training) { return null }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'export',
      jobData: { trainingId: training.trainingId }
    })

    await this.jobQueue.add(job)

    return job
  }

  async get(apiKey: string, jobId: string) {
    return await this.jobsRepository.first({ apiKey, id: jobId })
  }

  async list(apiKey: string) {
    return await this.jobsRepository.list({ apiKey })
  }
}
