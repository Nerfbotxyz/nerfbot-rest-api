export interface IRepository<T = {}> {
  tableName: string
}

export const REPOSITORIES = {
  ApiKeysRepository: Symbol.for('ApiKeysRepository'),
  ProcessRequestsRepository: Symbol.for('ProcessRequestsRepository'),
  UploadsRepository: Symbol.for('UploadsRepository'),
  UsersRepository: Symbol.for('UsersRepository')
}

export { default as ApiKeysRepository } from './apiKey'
export * from './apiKey'
export { default as ProcessRequestsRepository } from './processRequests'
export * from './processRequests'
export { default as UploadsRepository } from './uploads'
export * from './uploads'
export { default as UsersRepository } from './user'
export * from './user'
