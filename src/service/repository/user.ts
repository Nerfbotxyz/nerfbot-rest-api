import BaseRepository from './base'

export interface User {
  userId: number
  username: string
}

export default class UserRepository extends BaseRepository<User> {
  protected tableName: string = 'users'
}
