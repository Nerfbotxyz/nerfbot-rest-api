import { ParameterizedContext } from '~/app'
import { ApiKeysRepository } from '~/service/repository'

export interface AuthState {
  userId: number
  apiKey: string
}

export type ApiKeyMiddleware = (
  apiKeys: ApiKeysRepository
) => (
  ctx: ParameterizedContext,
  next: () => Promise<any>
) => Promise<void>

export default (
  apiKeys: ApiKeysRepository
) => async (
  ctx: ParameterizedContext,
  next: () => Promise<any>
) => {
  const token = Array.isArray(ctx.query.token)
    ? ctx.query.token[0]
    : ctx.query.token

  if (token) {
    const apiKey = await apiKeys.first({ apiKey: token })
    if (apiKey) {
      const { userId } = apiKey
      ctx.state.auth = { userId, apiKey: token }
      await next()
    } else {
      ctx.status = 401

      return
    }
  } else {
    ctx.status = 401

    return
  }
}
