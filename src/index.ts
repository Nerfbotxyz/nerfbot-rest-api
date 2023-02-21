import 'dotenv/config'
import NerfbotRestApi from './app'

;(async () => {
  const app = new NerfbotRestApi()

  app.start()

  process.on('SIGINT', () => { app.stop() })
  process.on('SIGTERM', () => { app.stop() })
})()
