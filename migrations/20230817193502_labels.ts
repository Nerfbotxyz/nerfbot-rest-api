import { Knex } from 'knex'

import { SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('uploads', table => {
    table.string('uploadName')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('processed', table => {
    table.string('label')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('trainings', table => {
    table.string('label')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('renders', table => {
    table.string('label')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('exports', table => {
    table.string('label')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('uploads', table => {
    table.dropColumn('uploadName')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('processed', table => {
    table.dropColumn('label')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('trainings', table => {
    table.dropColumn('label')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('renders', table => {
    table.dropColumn('label')
  })
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('exports', table => {
    table.dropColumn('label')
  })
}
