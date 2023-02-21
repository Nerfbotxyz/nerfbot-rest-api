import { ParameterizedContext } from '../../app'
import { ApiKeyRepository } from '../../service/repository'

export default (apiKeys: ApiKeyRepository) => async (
  ctx: ParameterizedContext,
  next: () => Promise<any>
) => {
  const token = Array.isArray(ctx.query.token)
    ? ctx.query.token[0]
    : ctx.query.token

  const validTokens = (await apiKeys.list()).map(key => key.apiKey)

  if (token && validTokens.includes(token)) {
    await next()
  } else {
    ctx.status = 401
  }
}
