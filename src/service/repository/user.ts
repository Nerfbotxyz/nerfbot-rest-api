import { PostgresAdapter } from '../../infra/db/adapter'

export default class UserRepository {
  constructor(private db: PostgresAdapter) {}
}
