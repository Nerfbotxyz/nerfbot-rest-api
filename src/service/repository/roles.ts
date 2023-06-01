import { injectable } from 'inversify'

import BaseRepository from './base'

export type RoleType = 'CREATE_API_KEY'
type RolesMap = { [key in RoleType]: key }
export const ROLES: RolesMap = {
  CREATE_API_KEY: 'CREATE_API_KEY'
}
export interface Role {
  apiKey: string
  role: RoleType
}

@injectable()
export default class RolesRepository extends BaseRepository<Role> {
  tableName: string = 'roles'

  async create(role: Role): Promise<Role> {
    const [ newRole ] = await this.table.insert(role).returning('*')

    return newRole
  }
}
