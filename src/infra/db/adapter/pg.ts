import knex, { Knex } from 'knex'

export default class PostgresAdapter {
  client!: Knex

  constructor(private connectionString: string) {
    this.client = knex({ client: 'pg', connection: connectionString })
  }
}
