export { default as requireApiToken } from './api-key'
export * from './api-key'

export const MIDDLEWARES = {
  ApiKeyMiddleware: Symbol.for('ApiKeyMiddleware')
}
