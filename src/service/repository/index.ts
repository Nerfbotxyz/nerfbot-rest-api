export interface IRepository<T = {}> {
  tableName: string
}

export const REPOSITORIES = {
  ApiKeysRepository: Symbol.for('ApiKeysRepository'),
  ExportsRepository: Symbol.for('ExportsRepository'),
  JobsRepository: Symbol.for('JobsRepository'),
  ProcessedRepository: Symbol.for('ProcessedRepository'),
  RendersRepository: Symbol.for('RendersRepository'),
  TrainingsRepository: Symbol.for('TrainingsRepository'),
  UploadsRepository: Symbol.for('UploadsRepository'),
  UsersRepository: Symbol.for('UsersRepository')
}

export { default as ApiKeysRepository } from './apiKey'
export * from './apiKey'
export { default as ExportsRepository } from './exports'
export * from './exports'
export { default as JobsRepository } from './jobs'
export * from './jobs'
export { default as ProcessedRepository } from './processed'
export * from './processed'
export { default as RendersRepository } from './renders'
export * from './renders'
export { default as TrainingsRepository } from './trainings'
export * from './trainings'
export { default as UploadsRepository } from './uploads'
export * from './uploads'
export { default as UsersRepository } from './user'
export * from './user'
