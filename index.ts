import http from 'http'
import app from './app'
import * as dotenv from 'dotenv'
const port = 8070;
dotenv.config();
const http_server = http.createServer(app)
http_server.listen(port, `0.0.0.0`, undefined, async () => {
  try {
    const server_url = `http://localhost:${port}`
    console.log(`Printer app is up and running on ${server_url}`)
  } catch (error) {
    console.log(`Error: Server couldn't start -> ${error}`)
  }
})