import BaseRepository from './base'

export default class UploadsRepository extends BaseRepository {
  protected tableName: string = 'uploads'

  async create(userId: number, apiKey: string, uploadId: string) {
    return await this.table.insert({ userId, apiKey, uploadId })
  }
}
