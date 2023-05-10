import { Knex } from 'knex'

import { onUpdateTrigger, SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).createTable('renders', table => {
    table.uuid('renderId')
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
    table.integer('userId')
      .notNullable()
      .references('userId')
      .inTable(`${SCHEMA_NAME}.users`)
    table.uuid('apiKey')
      .notNullable()
      .references('apiKey')
      .inTable(`${SCHEMA_NAME}.api_keys`)
    table.uuid('uploadId')
      .notNullable()
      .references('uploadId')
      .inTable(`${SCHEMA_NAME}.uploads`)
    table.uuid('processedId')
      .notNullable()
      .references('processedId')
      .inTable(`${SCHEMA_NAME}.processed`)
    table.uuid('trainingId')
      .notNullable()
      .references('trainingId')
      .inTable(`${SCHEMA_NAME}.trainings`)
    table.timestamps(true, true)
  })
  await knex.schema.withSchema(SCHEMA_NAME).raw(onUpdateTrigger('renders'))
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('renders')
}
