import { inject, injectable } from 'inversify'

import { PostgresAdapter } from '~/infra/db/adapter'
import { IRepository } from './'

const schema = 'nerfbot'

@injectable()
export default class BaseRepository<T extends {}> implements IRepository<T> {
  tableName: string = 'base'

  protected get table() {
    return this.db.client<T>(this.tableName).withSchema(schema)
  }

  constructor(@inject('PostgresAdapter') protected db: PostgresAdapter) {}

  async list(thing?: Partial<T>): Promise<T[]> {
    let query = this.table

    if (thing) {
      query = query.where(thing)
    }

    query.orderBy('created_at', 'desc')

    return await query.select<T>()
  }

  async first(thing: Partial<T>): Promise<T | null> {
    return await this.table.where(thing).first<T | undefined>() || null
  }
}
