import { PostgresAdapter } from '../../infra/db/adapter'

const schema = 'nerfbot'

export default class ApiKeyRepository {
  private get table() {
    return this.db.client.withSchema(schema).table('apiKeys')
  }

  constructor(private db: PostgresAdapter) {}

  async find(column: string, value: string) {
    return await this.table.select().where(column, value)
  }

  async list() {
    return await this.table.select()
  }
}
