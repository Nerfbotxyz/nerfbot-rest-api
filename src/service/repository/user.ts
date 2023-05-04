import { injectable } from 'inversify'

import BaseRepository from './base'

export interface User {
  userId: number
  username: string
}

@injectable()
export default class UsersRepository extends BaseRepository<User> {
  tableName: string = 'users'
}
