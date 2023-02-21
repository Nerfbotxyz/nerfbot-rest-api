import { Knex } from 'knex'

const SCHEMA_NAME = 'nerfbot'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createSchema(SCHEMA_NAME)

  await knex.schema.withSchema(SCHEMA_NAME).createTable('users', table => {
    table.increments('userId')
    table.string('username').unique()
  })

  await knex.schema.withSchema(SCHEMA_NAME).createTable('apiKeys', table => {
    table.increments('apiKeyId')
    table.uuid('apiKey')
      .unique()
      .notNullable()
      .defaultTo(knex.raw('gen_random_uuid()'))
    table.integer('userId')
      .notNullable()
      .references('userId')
      .inTable(`${SCHEMA_NAME}.users`)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('apiKeys')
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('users')

  await knex.schema.dropSchemaIfExists(SCHEMA_NAME)
}

