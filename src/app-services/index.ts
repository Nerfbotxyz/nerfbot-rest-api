export interface IAppService {}

export const APP_SERVICES = {
  UploadsAppService: Symbol.for('UploadsAppService'),
  JobsAppService: Symbol.for('JobsAppService')
}

export { default as UploadsAppService } from './uploads'
export { default as JobsAppService } from './jobs'
