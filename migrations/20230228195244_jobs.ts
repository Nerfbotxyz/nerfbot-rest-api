import { Knex } from 'knex'

import { onUpdateTrigger, SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME)
    .createTable('jobs', table => {
      table.uuid('id')
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
      table.enu(
        'status',
        ['WAITING', 'PROCESSING', 'ERROR', 'COMPLETE'],
        { useNative: true, enumName: 'job_status' }
      ).defaultTo('WAITING')
      table.string('jobName').notNullable()
      table.jsonb('jobData')
      table.timestamps(true, true)
    })
  await knex.schema.withSchema(SCHEMA_NAME)
    .raw(onUpdateTrigger('jobs'))
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME)
    .dropTableIfExists('jobs')
  await knex.schema.withSchema(SCHEMA_NAME)
    .raw(`DROP TYPE IF EXISTS ${SCHEMA_NAME}.job_status`)
}
