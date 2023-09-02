import chai from 'chai'
const expect = chai.expect

import { api, reset } from './setup'

describe('Nerfbot Rest API', () => {
  beforeEach(() => {
    reset()
  })

  describe('GET /', () => {
    const route = '/'

    it('Returns healthcheck', async () => {
      const res = await chai.request(api.server).get(route)
  
      expect(res).to.have.status(200)
      expect(res.body.health).to.equal('ok')
    })
  })

  describe('GET /healthcheck', () => {
    const route = '/healthcheck'

    it('Returns healthcheck', async () => {
      const res = await chai.request(api.server).get(route)
  
      expect(res).to.have.status(200)
      expect(res.body.health).to.equal('ok')
    })
  })
})
