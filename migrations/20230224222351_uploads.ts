import { Knex } from 'knex'

const SCHEMA_NAME = 'nerfbot'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).createTable('uploads', table => {
    table.uuid('uploadId').unique().notNullable().primary()
    table.integer('userId')
      .notNullable()
      .references('userId')
      .inTable(`${SCHEMA_NAME}.users`)
    table.uuid('apiKey')
      .notNullable()
      .references('apiKey')
      .inTable(`${SCHEMA_NAME}.apiKeys`)
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).dropTableIfExists('uploads')
}

