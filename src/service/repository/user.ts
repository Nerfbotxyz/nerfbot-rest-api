import BaseRepository from './base'

export interface User {
  userId: number
  username: string
}

export default class UsersRepository extends BaseRepository<User> {
  protected tableName: string = 'users'
}
