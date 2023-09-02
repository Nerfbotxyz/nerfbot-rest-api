import chai from 'chai'
const expect = chai.expect

import { api, reset } from './setup'
import { mockApiKeys, mockUploads } from './mock-data'

describe('Uploads', () => {
  beforeEach(() => {
    reset()
  })

  describe('HEAD /nerf/uploads', () => {
    const route = '/nerf/uploads'

    it('Rejects unauthorized requests', async () => {
      const res = await chai
        .request(api.server)
        .head(route)

      expect(res).to.have.status(401)
    })

    it('Returns Accept header for form data types', async () => {
      const res = await chai
        .request(api.server)
        .head(route)
        .query({ token: mockApiKeys[0].apiKey })

      expect(res).to.have.status(200)
      expect(res).to.have.header(
        'Accept',
        'multipart/form-data, application/x-www-form-urlencoded'
      )
    })
  })

  describe('POST /nerf/uploads', () => {
    const route = '/nerf/uploads'

    it('Rejects unauthorized requests', async () => {
      const res = await chai.request(api.server).post(route).send()

      expect(res).to.have.status(401)
    })

    it('Returns upload id on upload')
    it('HTTP 411 Length Required')
    it('HTTP 413 Content Too Large')
    it('HTTP 415 Unsupported Media Type')
    it('HTTP 500')
  })

  describe('GET /nerf/uploads', () => {
    const route = '/nerf/uploads'

    it('Rejects unauthorized requests', async () => {
      const res = await chai.request(api.server).get(route)

      expect(res).to.have.status(401)
    })

    it('Returns list of uploads', async () => {
      const res = await chai
        .request(api.server)
        .get(route)
        .query({ token: mockApiKeys[0].apiKey })

      expect(res).to.have.status(200)
      expect(res.body.uploads).to.be.an('array')
    })

    it('HTTP 500')
  })

  describe('GET /nerf/uploads/:uploadId', () => {
    const uploadId = mockUploads[0].uploadId
    const route = `/nerf/uploads/${uploadId}`

    it('Rejects unauthorized requests', async () => {
      const res = await chai.request(api.server).get(route)

      expect(res).to.have.status(401)
    })

    it('Returns the requested upload', async () => {
      const res = await chai
        .request(api.server)
        .get(route)
        .query({ token: mockApiKeys[0].apiKey })
      
      expect(res).to.have.status(200)
      expect(res.body.upload).to.exist
    })

    it('HTTP 404')
    it('HTTP 500')
  })

  describe('POST /nerf/uploads/:uploadId/process', () => {
    const uploadId = mockUploads[0].uploadId
    const route = `/nerf/uploads/${uploadId}/process`

    it('Rejects unauthorized requests', async () => {
      const res = await chai.request(api.server).post(route).send()

      expect(res).to.have.status(401)
    })

    it('Returns newly created job when processing upload', async () => {
      const res = await chai
        .request(api.server)
        .post(route)
        .query({ token: mockApiKeys[0].apiKey })
        .send()

      console.log('upload job', res.body)

      expect(res).to.have.status(200)
      expect(res.body.apiKey).to.equal(mockApiKeys[0].apiKey)
      expect(res.body.jobName).to.equal('process')
      expect(res.body.status).to.equal('WAITING')
      expect(res.body.jobData).to.deep.equal({
        uploadId,
        mediaType: mockUploads[0].mediaType
      })
    })

    it('Callback URL tests')
    it('HTTP 404')
    it('HTTP 500')
  })
})
