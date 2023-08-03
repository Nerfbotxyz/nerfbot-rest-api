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
    callbackURL?: string
  ) {
    this.logger.info('createProcessJob', { apiKey, uploadId, callbackURL })
    const upload = await this.uploadsAppService.get(apiKey, uploadId)
    if (!upload) { return null }

    const jobData: any = {
      uploadId: upload.uploadId,
      mediaType: upload.mediaType
    }

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
    processedId: string,
    callbackURL?: string
  ) {
    this.logger.info(
      'createTrainingJob',
      { apiKey, processedId, callbackURL }
    )
    const processed = await this.processedAppService.get(apiKey, processedId)
    if (!processed) { return null }

    const jobData: any = { processedId: processed.processedId }

    if (callbackURL) {
      jobData.callbackURL = callbackURL
    }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'train',
      jobData
    })

    await this.jobQueue.add(job)

    return job
  }

  async createRenderJob(
    userId: number,
    apiKey: string,
    trainingId: string,
    _renderType?: any,
    _orbitalRadius?: any,
    _downscaleFactor?: any,
    callbackURL?: string
  ) {
    this.logger.info(
      'createRenderJob',
      { 
      apiKey, 
      trainingId, 
      renderType: _renderType, 
      orbitalRadius: _orbitalRadius, 
      downscaleFactor: _downscaleFactor, 
      callbackURL 
      }
    )

    let renderType: 'orbital' | 'interpolate' | 'spiral' = 'orbital'
    let orbitalRadius: 1 | 0.5 | 1.5 = 1
    let downscaleFactor: number = 1

    if (
      typeof _renderType === 'string'
      && ['interpolate', 'spiral'].includes(_renderType)
    ) {
      renderType = _renderType as 'interpolate' | 'spiral'
    }

    if (
      typeof _orbitalRadius === 'number'
      && [0.5, 1.5].includes(_orbitalRadius)
    ) {
      orbitalRadius = _orbitalRadius as 0.5 | 1.5
    }

    if (
      typeof _downscaleFactor === 'number' 
      && _downscaleFactor >= 1 
      && _downscaleFactor <= 3
    ) {
      downscaleFactor = _downscaleFactor
    }

    const training = await this.trainingsAppService.get(apiKey, trainingId)
    if (!training) { return null }

    const jobData: any = { 
      trainingId: training.trainingId,
      renderType,
      orbitalRadius,
      downscaleFactor
    }

    if (callbackURL) {
      jobData.callbackURL = callbackURL
    }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'render',
      jobData
    })

    await this.jobQueue.add(job)

    return job
  }

  async createExportJob(
    userId: number,
    apiKey: string,
    trainingId: string,
    callbackURL?: string
  ) {
    this.logger.info(
      'createExportJob',
      { apiKey, trainingId, callbackURL }
    )
    const training = await this.trainingsAppService.get(apiKey, trainingId)
    if (!training) { return null }

    const jobData: any = { trainingId: training.trainingId }

    if (callbackURL) {
      jobData.callbackURL = callbackURL
    }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'export',
      jobData
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
