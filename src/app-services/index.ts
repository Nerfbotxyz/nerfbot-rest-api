export interface IAppService {}

export const APP_SERVICES = {
  UploadsAppService: Symbol.for('UploadsAppService'),
  JobsAppService: Symbol.for('JobsAppService'),
  ProcessedAppService: Symbol.for('ProcessedAppService'),
  TrainingsAppService: Symbol.for('TrainingsAppService'),
  RendersAppService: Symbol.for('RendersAppService')
}

export { default as UploadsAppService } from './uploads'
export { default as JobsAppService } from './jobs'
export { default as ProcessedAppService } from './processed'
export { default as TrainingsAppService } from './trainings'
export { default as RendersAppService } from './renders'
