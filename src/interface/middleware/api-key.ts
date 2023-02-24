import { ParameterizedContext } from '../../app'
import { ApiKeyRepository, UserRepository } from '../../service/repository'

export default (apiKeys: ApiKeyRepository) => async (
  ctx: ParameterizedContext,
  next: () => Promise<any>
) => {
  const token = Array.isArray(ctx.query.token)
    ? ctx.query.token[0]
    : ctx.query.token

  if (token) {
    const apiKey = await apiKeys.first('apiKey', token)
    if (apiKey) {
      const { userId } = apiKey
      ctx.state.auth = { userId, apiKey: token }
      await next()
    }

    ctx.status = 401
  } else {
    ctx.status = 401
  }
}