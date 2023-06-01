import { Knex } from 'knex'

import { SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('api_keys', table => {
    table.string('label')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('api_keys', table => {
    table.dropColumn('label')
  })
}
