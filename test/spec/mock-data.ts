import {
  ApiKey,
  Upload,
  User
} from '../../src/service/repository'

export const mockUsers: User[] = [
  { userId: 1, username: 'mock-username-1' },
  { userId: 2, username: 'mock-username-2' },
  { userId: 3, username: 'mock-username-3' }
]

export const mockApiKeys: ApiKey[] = [
  { apiKeyId: 1, apiKey: 'mock-api-key-1', userId: 1 },
  { apiKeyId: 2, apiKey: 'mock-api-key-2', userId: 2 },
  { apiKeyId: 3, apiKey: 'mock-api-key-3', userId: 3 }
]

export const mockUploads: Upload[] = [
  {
    userId: 1,
    apiKey: 'mock-api-key-1',
    uploadId: 'mock-upload-id-1',
    mediaType: 'video'
  }
]
