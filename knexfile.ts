import 'dotenv/config'
import { Knex } from 'knex'

const user = process.env.DB_USER || 'DB_USER not set!'
const pass = process.env.DB_PASS || 'DB_PASS not set!'
const host = process.env.DB_HOST || 'DB_HOST not set!'
const port = process.env.DB_PORT || 'DB_PORT not set!'
const name = process.env.DB_NAME || 'postgres'

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: `postgresql://${user}:${pass}@${host}:${port}/${name}`
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};

module.exports = config;
