import { Knex } from 'knex'

import { onUpdateTrigger, SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME)
    .createTable('process_requests', table => {
      table.uuid('processRequestId')
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
      table.enu(
        'status',
        ['WAITING', 'PROCESSING', 'ERROR', 'COMPLETE'],
        { useNative: true, enumName: 'request_status' }
      ).defaultTo('WAITING')
      table.timestamps(true, true)
    })
  await knex.schema.withSchema(SCHEMA_NAME)
    .raw(onUpdateTrigger('process_requests'))
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME)
    .dropTableIfExists('process_requests')
  await knex.schema.withSchema(SCHEMA_NAME)
    .raw(`DROP TYPE IF EXISTS ${SCHEMA_NAME}.request_status`)
}
