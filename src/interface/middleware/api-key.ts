import { ParameterizedContext } from '../../app'

const validTokens: string[] = ['valid']

export default async function (
  ctx: ParameterizedContext,
  next: () => Promise<any>
) {
  const token = Array.isArray(ctx.query.token)
    ? ctx.query.token[0]
    : ctx.query.token

  if (token && validTokens.includes(token)) {
    await next()
  } else {
    ctx.status = 401
  }
}
