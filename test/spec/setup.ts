import 'reflect-metadata'
import 'mocha'
import chai from 'chai'
import * as sinon from 'sinon'
import chaiHttp from 'chai-http'

import NerfbotRestApi from '../../src/app'
import {
  ApiKeysRepository,
  ExportsRepository,
  JobsRepository,
  ProcessedRepository,
  REPOSITORIES,
  RendersRepository,
  RolesRepository,
  TrainingsRepository,
  UploadsRepository,
  UsersRepository
} from '../../src/service/repository'
import * as deps from '../../src/inversify.config'
import { PostgresAdapter } from '../../src/infra/db/adapter'
import { S3Adapter } from '../../src/infra/bucket/adapter'
import { BullAdapter } from '../../src/infra/queue/adapter'
import { mockApiKeys, mockUploads, mockUsers } from './mock-data'
import { CallbacksQueue, JobsQueue, QUEUES } from '../../src/service/queue'
import { Job } from '../../src/core'

chai.use(chaiHttp)

const container = deps.buildContainer()

const pg = new PostgresAdapter('mock-connection-string')
pg.client = sinon.stub() as any
pg.client.raw = sinon.stub() as any

const s3 = sinon.createStubInstance(S3Adapter, {
  testConnection: sinon.stub().resolves() as any
})

const bull = sinon.createStubInstance(BullAdapter)

container.unbind('S3Adapter')
container.bind('S3Adapter').toConstantValue(s3)
container.unbind('PostgresAdapter')
container.bind('PostgresAdapter').toConstantValue(pg)
container.unbind('BullAdapter')
container.bind('BullAdapter').toConstantValue(bull)

// Bind mock api key data
const apiKeysFirst = sinon.stub()
mockApiKeys.forEach(mockApiKey => {
  const { apiKey } = mockApiKey
  apiKeysFirst.withArgs({ apiKey }).resolves(mockApiKey)
})
const apiKeysRepository = sinon.createStubInstance(ApiKeysRepository, {
  first: apiKeysFirst as any
})
container.unbind(REPOSITORIES.ApiKeysRepository)
container.bind(REPOSITORIES.ApiKeysRepository)
  .toConstantValue(apiKeysRepository)

// Bind mock exports data
container.unbind(REPOSITORIES.ExportsRepository)
container.bind(REPOSITORIES.ExportsRepository)
  .toConstantValue(sinon.createStubInstance(ExportsRepository))

// Bind mock jobs data
const jobsRepository = sinon.createStubInstance(JobsRepository, {
  create: sinon
    .stub()
    .callsFake(async (job: Omit<Job<any>, 'id' | 'status'>) => {
      return {
        ...job,
        id: 'mock-job-id',
        status: 'WAITING'
      }
    }) as any
})
container.unbind(REPOSITORIES.JobsRepository)
container.bind(REPOSITORIES.JobsRepository)
  .toConstantValue(jobsRepository)

// Bind mock processed data
container.unbind(REPOSITORIES.ProcessedRepository)
container.bind(REPOSITORIES.ProcessedRepository)
  .toConstantValue(sinon.createStubInstance(ProcessedRepository))

// Bind mock renders data
container.unbind(REPOSITORIES.RendersRepository)
container.bind(REPOSITORIES.RendersRepository)
  .toConstantValue(sinon.createStubInstance(RendersRepository))

// Bind mock roles data
container.unbind(REPOSITORIES.RolesRepository)
container.bind(REPOSITORIES.RolesRepository)
  .toConstantValue(sinon.createStubInstance(RolesRepository))

// Bind mock training data
container.unbind(REPOSITORIES.TrainingsRepository)
container.bind(REPOSITORIES.TrainingsRepository)
  .toConstantValue(sinon.createStubInstance(TrainingsRepository))

// Bind mock uploads data
const listUploads = sinon.stub()
mockApiKeys.forEach(mockApiKey => {
  const { apiKey } = mockApiKey
  const uploads = mockUploads.filter(upload => upload.apiKey === apiKey)
  listUploads.withArgs({ apiKey }).resolves(uploads)
})
const firstUploads = sinon.stub()
mockUploads.forEach(mockUpload => {
  const { apiKey, uploadId } = mockUpload
  firstUploads.withArgs({ apiKey, uploadId }).resolves(mockUpload)
})
const uploadsRepository = sinon.createStubInstance(UploadsRepository, {
  list: listUploads as any,
  first: firstUploads as any
})
container.unbind(REPOSITORIES.UploadsRepository)
container.bind(REPOSITORIES.UploadsRepository)
  .toConstantValue(uploadsRepository)

// Bind mock users data
container.unbind(REPOSITORIES.UsersRepository)
container.bind(REPOSITORIES.UsersRepository)
  .toConstantValue(sinon.createStubInstance(UsersRepository))

container.unbind(QUEUES.JobsQueue)
const jobsQueue = sinon.createStubInstance(JobsQueue, {
  add: sinon.stub().resolves() as any
})
container.bind(QUEUES.JobsQueue).toConstantValue(jobsQueue)
container.unbind(QUEUES.CallbacksQueue)
const callbacksQueue = sinon.createStubInstance(CallbacksQueue)
container.bind(QUEUES.CallbacksQueue).toConstantValue(callbacksQueue)

sinon.stub(deps, 'buildContainer').returns(container)
const api = new NerfbotRestApi()
sinon.stub(api, 'createTestRedisClient').returns(
  { connect() {}, disconnect() {} } as any
)
api.start()

function reset() {}
reset()

export { api, reset }
