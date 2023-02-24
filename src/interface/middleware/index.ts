export { default as requireApiToken } from './api-key'

export interface AuthState {
  userId: number
  apiKey: string
}
