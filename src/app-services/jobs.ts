import { inject, injectable } from 'inversify'
import { JobQueue, QUEUES } from '~/service/queue'
import { JobsRepository, REPOSITORIES } from '~/service/repository'
import {
  APP_SERVICES,
  ProcessedAppService,
  TrainingsAppService,
  UploadsAppService
} from './'

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
  constructor(
    @inject(QUEUES.JobQueue) private jobQueue: JobQueue,
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
    mediaType: string
  ) {
    const upload = await this.uploadsAppService.get(apiKey, uploadId)
    if (!upload) { return null }

    // TODO -> validate media type to NerfProcessDataInputType
    const job = await this.jobsRepository.create({
      userId,
      apiKey,
      jobName: 'process',
      jobData: { uploadId: upload.uploadId, mediaType }
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
