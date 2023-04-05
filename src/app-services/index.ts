export interface IAppService {}

export const APP_SERVICES = {
  UploadsAppService: Symbol.for('UploadsAppService'),
  ProcessRequestsAppService: Symbol.for('ProcessRequestsAppService')
}

export { default as UploadsAppService } from './uploads'
export { default as ProcessRequestsAppService } from './processRequests'
