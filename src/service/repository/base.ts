import { PostgresAdapter } from '../../infra/db/adapter'

const schema = 'nerfbot'

export default class BaseRepository<T extends {}> {
  protected tableName: string = 'base'

  protected get table() {
    return this.db.client<T>(this.tableName).withSchema(schema)
  }

  constructor(protected db: PostgresAdapter) {}

  async list(
    column?: string,
    value?: string | number
  ): Promise<T[]> {
    let query = this.table

    if (column) {
      query = query.where(column, value)
    }

    return await query.select<T>()
  }

  async first(column: string, value: any): Promise<T | null> {
    return await this.table.where(column, value).first<T | undefined>() || null
  }
}
