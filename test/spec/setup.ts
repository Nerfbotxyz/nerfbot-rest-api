import 'reflect-metadata'
import 'mocha'
import chai from 'chai'
import * as sinon from 'sinon'
import chaiHttp from 'chai-http'
import { Container } from 'inversify'

import NerfbotRestApi from '../../src/app'
import { ApiKeysRepository, UploadsRepository } from '../../src/service/repository'
import {
  NerfRouter,
  NerfJobsRouter,
  NerfUploadsRouter,
  NerfTrainingsRouter,
  NerfProcessedRouter,
  NerfRendersRouter,
  NerfExportsRouter,
  ROUTERS,
  AuthRouter
} from '../../src/interface/router'
import * as deps from '../../src/inversify.config'
import { PostgresAdapter } from '../../src/infra/db/adapter'
import {
  AuthAppService,
  ExportsAppService,
  JobsAppService,
  ProcessedAppService,
  RendersAppService,
  TrainingsAppService,
  UploadsAppService
} from '../../src/app-services'
import { S3Adapter } from '../../src/infra/bucket/adapter'
import apiKeyMiddleware, { ApiKeyMiddleware } from '../../src/interface/middleware/api-key'
import { UploadsBucket } from '../../src/service/bucket'

chai.use(chaiHttp)

const VALID_API_KEY = 'valid-api-key'

let apiKeys: ApiKeysRepository,
    requireApiToken: ApiKeyMiddleware,
    authAppService: sinon.SinonStubbedInstance<AuthAppService>,
    jobsAppService: sinon.SinonStubbedInstance<JobsAppService>,
    uploadsAppService: UploadsAppService,
    processedAppService: sinon.SinonStubbedInstance<ProcessedAppService>,
    trainingsAppService: sinon.SinonStubbedInstance<TrainingsAppService>,
    rendersAppService: sinon.SinonStubbedInstance<RendersAppService>,
    exportsAppService: sinon.SinonStubbedInstance<ExportsAppService>,
    uploadsBucket: sinon.SinonStubbedInstance<UploadsBucket>,
    uploadsRepository: sinon.SinonStubbedInstance<UploadsRepository>

function reset() {
  apiKeys = new ApiKeysRepository(pg)
  const apiKeysFirst = sinon.stub(apiKeys, 'first')
  apiKeysFirst.resolves(null)
  apiKeysFirst.withArgs({ apiKey: VALID_API_KEY }).resolves({
    apiKeyId: 1,
    apiKey: VALID_API_KEY,
    userId: 1
  })
  uploadsBucket = sinon.createStubInstance(UploadsBucket)
  uploadsRepository = sinon.createStubInstance(UploadsRepository)
  requireApiToken = () => apiKeyMiddleware(apiKeys)
  authAppService = sinon.createStubInstance(AuthAppService)
  jobsAppService = sinon.createStubInstance(JobsAppService)
  uploadsAppService = new UploadsAppService(uploadsBucket, uploadsRepository)
  const uploadsAppServiceList = sinon.stub(uploadsAppService, 'list')
  uploadsAppServiceList.resolves([])
  processedAppService = sinon.createStubInstance(ProcessedAppService)
  trainingsAppService = sinon.createStubInstance(TrainingsAppService)
  rendersAppService = sinon.createStubInstance(RendersAppService)
  exportsAppService = sinon.createStubInstance(ExportsAppService)
}

const container = new Container()
const containerGet = sinon.stub(container, 'get')

const pg = new PostgresAdapter('mock-connection-string')
pg.client = sinon.stub(pg.client)
containerGet.withArgs('PostgresAdapter').returns(pg)

const s3 = sinon.createStubInstance(S3Adapter, {
  testConnection: sinon.stub().resolves() as any
})
containerGet.withArgs('S3Adapter').returns(s3)

reset()

const authRouter = new AuthRouter(apiKeys!, requireApiToken!, authAppService!)
containerGet.withArgs(ROUTERS.AuthRouter).returns(authRouter)

const jobsRouter = new NerfJobsRouter(jobsAppService!)
const uploadsRouter = new NerfUploadsRouter(uploadsAppService!, jobsAppService!)

const processedRouter = new NerfProcessedRouter(processedAppService!, jobsAppService!)
const trainingsRouter = new NerfTrainingsRouter(trainingsAppService!, jobsAppService!)
const rendersRouter = new NerfRendersRouter(rendersAppService!)
const exportsRouter = new NerfExportsRouter(exportsAppService!)

const nerfRouter = new NerfRouter(
  apiKeys!,
  requireApiToken!,
  jobsRouter,
  uploadsRouter,
  processedRouter,
  trainingsRouter,
  rendersRouter,
  exportsRouter
)
containerGet.withArgs(ROUTERS.NerfRouter).returns(nerfRouter)
sinon.stub(deps, 'buildContainer').returns(container)

const api = new NerfbotRestApi()
sinon.stub(api, 'createTestRedisClient').returns(
  { connect() {}, disconnect() {} } as any
)

api.start()

export { api, reset, VALID_API_KEY }
