import { Knex } from 'knex'

import { SCHEMA_NAME } from '../knexfile'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).raw(`
    CREATE TYPE ${SCHEMA_NAME}.media_type AS ENUM (
      'images',
      'video',
      'polycam',
      'metashape',
      'realitycapture',
      'record3d'
    )
  `)

  await knex.schema.withSchema(SCHEMA_NAME).alterTable('uploads', table => {
    table
      .enum('mediaType', null, {
        useNative: true,
        existingType: true,
        enumName: 'media_type'
      })
      .notNullable()
      .defaultTo('video')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema(SCHEMA_NAME).alterTable('uploads', table => {
    table.dropColumn('mediaType')
  })

  await knex.schema.raw(`DROP TYPE IF EXISTS ${SCHEMA_NAME}.media_type`)
}
