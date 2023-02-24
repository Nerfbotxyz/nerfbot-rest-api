import { PostgresAdapter } from '../../infra/db/adapter'

const schema = 'nerfbot'

export default class BaseRepository {
  protected tableName: string = 'base'

  protected get table() {
    return this.db.client.withSchema(schema).table(this.tableName)
  }

  constructor(protected db: PostgresAdapter) {}
}
