import { PostgresAdapter } from '../../infra/db/adapter'

const schema = 'nerfbot'

export default class BaseRepository<T extends {}> {
  protected tableName: string = 'base'

  protected get table() {
    return this.db.client<T>(this.tableName).withSchema(schema)
  }

  constructor(protected db: PostgresAdapter) {}

  async list(thing?: Partial<T>): Promise<T[]> {
    let query = this.table

    if (thing) {
      query = query.where(thing)
    }

    return await query.select<T>()
  }

  async first(thing: Partial<T>): Promise<T | null> {
    return await this.table.where(thing).first<T | undefined>() || null
  }
}
