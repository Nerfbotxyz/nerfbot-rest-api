import chai from 'chai'
const expect = chai.expect

import { api, reset, VALID_API_KEY } from './setup'

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
        .query({ token: VALID_API_KEY })

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
        .query({ token: VALID_API_KEY })

      expect(res).to.have.status(200)
      expect(res.body.uploads).to.be.an('array')
    })
  })

  describe('GET /nerf/uploads/:uploadId', () => {
    const route = '/nerf/uploads/mock-upload-id'

    it('Rejects unauthorized requests', async () => {
      const res = await chai.request(api.server).get(route)

      expect(res).to.have.status(401)
    })
  })

  describe('POST /nerf/uploads/:uploadId/process', () => {
    const route = '/nerf/uploads/mock-upload-id/process'

    it('Rejects unauthorized requests', async () => {
      const res = await chai.request(api.server).post(route).send()

      expect(res).to.have.status(401)
    })
  })
})
