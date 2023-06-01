import { Knex } from 'knex'

import { onUpdateTrigger, SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).raw(`
    CREATE TYPE ${SCHEMA_NAME}.role AS ENUM ('CREATE_API_KEY')
  `)

  await knex.schema.withSchema(SCHEMA_NAME).createTable('roles', table => {
    table.uuid('apiKey')
      .notNullable()
      .references('apiKey')
      .inTable(`${SCHEMA_NAME}.api_keys`)
    table.enum('role', null, {
      useNative: true,
      existingType: true,
      enumName: 'role'
    })
    table.timestamps(true, true)
    table.primary(['apiKey', 'role'])
  })
  
  await knex.schema.withSchema(SCHEMA_NAME).raw(onUpdateTrigger('roles'))
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('roles')

  await knex.schema.raw(`DROP TYPE IF EXISTS ${SCHEMA_NAME}.role`)
}
