export interface IRepository<T = {}> {
  tableName: string
}

export const REPOSITORIES = {
  ApiKeysRepository: Symbol.for('ApiKeysRepository'),
  JobsRepository: Symbol.for('JobsRepository'),
  UploadsRepository: Symbol.for('UploadsRepository'),
  UsersRepository: Symbol.for('UsersRepository')
}

export { default as ApiKeysRepository } from './apiKey'
export * from './apiKey'
export { default as JobsRepository } from './jobs'
export * from './jobs'
export { default as UploadsRepository } from './uploads'
export * from './uploads'
export { default as UsersRepository } from './user'
export * from './user'
