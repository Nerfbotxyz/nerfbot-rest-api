import 'dotenv/config'
import 'reflect-metadata'
import NerfbotRestApi from './app'

;(async () => {
  const app = new NerfbotRestApi()

  app.start()

  process.on('SIGINT', async () => {
    await app.stop()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    await app.stop()
    process.exit(0)
  })
})()
