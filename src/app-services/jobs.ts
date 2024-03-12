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
import { Job } from '~/core'

export type NerfProcessDataInputType =
  | 'images'
  | 'video'
  | 'polycam'
  | 'metashape'
  | 'realitycapture'
  | 'record3d'

const ENABLED_MEDIA_TYPES: NerfProcessDataInputType[] = [ 'images', 'video' ]

const ORBIT_RADII = [ 0.5, 1, 1.5 ]
type OrbitRadius = 0.5 | 1 | 1.5
const ORBIT_ANGLES = [ 15, 30, 45 ]
type OrbitAngle = 15 | 30 | 25

export interface BaseJobOpts {
  callbackURL?: any
  label?: string
}

export interface CreateRenderJobOpts extends BaseJobOpts {
  renderType?: any
  orbitalRadius?: any
  orbitalAngle?: any
  downscaleFactor?: any
} 

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
    label?: string,
    callbackURL?: string
  ) {
    this.logger.info('createProcessJob', {
      apiKey,
      uploadId,
      label,
      callbackURL
    })
    const upload = await this.uploadsAppService.get(apiKey, uploadId)
    if (!upload) { return null }

    const jobData: any = {
      uploadId: upload.uploadId,
      mediaType: upload.mediaType,
      label: typeof label === 'string' ? label : upload.uploadName
    }

    return this.createJob(userId, apiKey, 'process', jobData, callbackURL)
  }

  async createTrainingJob(
    userId: number,
    apiKey: string,
    processedId: string,
    label?: string,
    callbackURL?: string
  ) {
    this.logger.info(
      'createTrainingJob',
      { apiKey, processedId, label, callbackURL }
    )
    const processed = await this.processedAppService.get(apiKey, processedId)
    if (!processed) { return null }

    const jobData: any = { 
      processedId: processed.processedId,
      label: typeof label === 'string' ? label : processed.label
     }

    return this.createJob(userId, apiKey, 'train', jobData, callbackURL)
  }

  async createRenderJob(
    userId: number,
    apiKey: string,
    trainingId: string,
    opts: CreateRenderJobOpts
  ) {
    this.logger.info(
      'createRenderJob',
      {
        apiKey,
        trainingId,
        opts
      }
    )

    let renderType: 'orbital' | 'interpolate' | 'spiral' = 'orbital'
    let orbitalRadius: OrbitRadius = 1
    let orbitalAngle: OrbitAngle = 15
    let downscaleFactor: number = 1

    if (
      typeof opts.renderType === 'string'
      && ['interpolate', 'spiral'].includes(opts.renderType)
    ) {
      renderType = opts.renderType as 'interpolate' | 'spiral'
    }

    if (
      typeof opts.orbitalRadius === 'number'
      && ORBIT_RADII.includes(opts.orbitalRadius)
    ) {
      orbitalRadius = opts.orbitalRadius as OrbitRadius
    }

    if (
      typeof opts.orbitalAngle === 'number'
      && ORBIT_ANGLES.includes(opts.orbitalAngle)
    ) {
      orbitalAngle = opts.orbitalAngle as OrbitAngle
    }

    if (
      typeof opts.downscaleFactor === 'number' 
      && opts.downscaleFactor >= 1 
      && opts.downscaleFactor <= 3
    ) {
      downscaleFactor = opts.downscaleFactor
    }

    const training = await this.trainingsAppService.get(apiKey, trainingId)
    if (!training) { return null }

    const jobData: any = {
      trainingId: training.trainingId,
      renderType,
      orbitalRadius,
      downscaleFactor,
      label: typeof opts.label === 'string' ? opts.label : training.label,
      orbitalAngle
    }

    return this.createJob(userId, apiKey, 'render', jobData, opts.callbackURL)
  }

  async createExportJob(
    userId: number,
    apiKey: string,
    trainingId: string,
    label?: string,
    callbackURL?: string
  ) {
    this.logger.info(
      'createExportJob',
      { apiKey, trainingId, label, callbackURL }
    )
    const training = await this.trainingsAppService.get(apiKey, trainingId)
    if (!training) { return null }

    const jobData: any = {
      trainingId: training.trainingId,
      label: typeof label === 'string' ? label : training.label
    }

    return this.createJob(userId, apiKey, 'export', jobData, callbackURL)
  }

  private async createJob(
    userId: number,
    apiKey: string,
    jobName: string,
    jobData: any,
    callbackURL?: any
  ): Promise<Job<any> | null> {
    if (typeof callbackURL === 'string') {
      jobData.callbackURL = callbackURL
    }

    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName,
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
