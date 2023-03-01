import { Knex } from 'knex'

import { onUpdateTrigger, SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createSchema(SCHEMA_NAME)

  await knex.raw(`
    CREATE OR REPLACE FUNCTION on_update_timestamp()
    RETURNS TRIGGER AS
    $FUNC$
      BEGIN
        NEW."updated_at" = now();
        RETURN NEW;
      END;
    $FUNC$
    LANGUAGE plpgsql;
  `)

  await knex.schema.withSchema(SCHEMA_NAME).createTable('users', table => {
    table.increments('userId')
    table.string('username').unique()
    table.timestamps(true, true)
  })
  await knex.schema.withSchema(SCHEMA_NAME).raw(onUpdateTrigger('users'))

  await knex.schema.withSchema(SCHEMA_NAME).createTable('api_keys', table => {
    table.increments('apiKeyId')
    table.uuid('apiKey')
      .unique()
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
    table.integer('userId')
      .notNullable()
      .references('userId')
      .inTable(`${SCHEMA_NAME}.users`)
    table.timestamps(true, true)
  })
  await knex.schema.withSchema(SCHEMA_NAME).raw(onUpdateTrigger('api_keys'))
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('api_keys')
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('users')

  await knex.raw(`DROP FUNCTION IF EXISTS on_update_timestamp`)

  await knex.schema.dropSchemaIfExists(SCHEMA_NAME)
}

