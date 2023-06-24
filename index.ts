import {port} from './constants'
import logger from './logger'
import http from 'http'
import app from './app'
import Ngrok from './ngrok/Ngrok'
import * as dotenv from 'dotenv'
import axios from 'axios'
import {getCurrentMac} from './utils'

dotenv.config();
const ADD_SERVER_HTTP = process.env.ADD_SERVER_HTTP || 'https://gmdstagingapp.azurewebsites.net/api/add-server-http';
const GET_PRINTER_STORE_EMAIL_HTTP = process.env.GET_PRINTER_STORE_EMAIL_HTTP || 'https://gmdstagingapp.azurewebsites.net/api/get-printer-store-email-http';

const http_server = http.createServer(app)

process.stdin.resume()

process.on('SIGINT', async () => {
  await Ngrok.kill()
  process.exit()
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('uncaughtException', (error: Error, origin: string) => {
  console.log('[uncaughtException]', error)
  logger.info('[uncaughtException]', error)
})

// This is for closing ngrok connection on every code changes during development.
if (process.env.NODE_ENV === 'development') {
  process.on('SIGUSR1', async () => {
    await Ngrok.kill()
    process.exit()
  })
  process.on('SIGUSR2', async () => {
    await Ngrok.kill()
    process.exit()
  })
}
http_server.listen(port, `0.0.0.0`, undefined, async () => {
  try {
    const server_url = `http://localhost:${port}`
    console.log(`Printer app is up and running on ${server_url}`)
    logger.info(`Printer app is up and running on ${server_url}`)
    const ngrok_url = (await Ngrok.init()) as string
    const serverMac = await getCurrentMac()
    if (ngrok_url) await sendMacNgrok(ngrok_url, serverMac)
  } catch (error) {
    console.log(`Error: Server couldn't start -> ${error}`)
  }
})

const sendMacNgrok = async (ngrokUrl: string, serverMac: string) => {
  try {
    const res = await axios.post(
      `${GET_PRINTER_STORE_EMAIL_HTTP}`,
      {
        mac: serverMac,
      },
      {headers: {'Content-Type': 'application/json'}},
    )

    if (res.status !== 200) {
      console.log(
        `\x1b[31m An error occurred while getting store email from database! ${res.statusText} \x1b[0m`,
      )
      return
    }

    const storeEmail = res.data

    console.log(`Current mac: ${serverMac}`)
    console.log(`Current email: ${storeEmail}`)
    console.log(`\x1b[33m Saving ngrok url into database... \x1b[0m`)

    const response = await axios.post(
      `${ADD_SERVER_HTTP}`,
      {
        servers: [
          {
            Email: storeEmail,
            Url: ngrokUrl,
          },
        ],
      },
      {headers: {'Content-Type': 'application/json'}},
    )

    console.log(`\x1b[33m ${response.status} - ${response.statusText} \x1b[0m`)
  } catch (error) {
    console.log(
      `\x1b[31m An error occurred while saving ngrok url into database! ${error} \x1b[0m`,
    )
  }
}
