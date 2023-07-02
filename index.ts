import http from 'http'
import app from './app'
import * as dotenv from 'dotenv'
import { port } from './cons';
// import Tunnel from './Tunnel';
dotenv.config();
const http_server = http.createServer(app)
http_server.listen(port, async () => {
  try {
    const server_url = `http://localhost:${port}`;
    console.log(`Printer app is up and running on ${server_url}`);
    // await Tunnel.init();
  } catch (error) {
    console.log(`Error: Server couldn't start -> ${error}`)
  }
})