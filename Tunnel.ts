import { port } from './cons';
import ngrok, { NgrokClientError, ErrorBody } from 'ngrok'
class Ngrok {
  public async init(): Promise<string | undefined> {
    try {
      console.log(`\x1b[33m [ngrok] -> Initializing tunnel... \x1b[0m`)
      const tunnel_url = await ngrok.connect({
        proto: 'http',
        addr: port,
        region: `us`,
        authtoken: `2FhpQqPTjwZptui34wQRsUDdkaQ_55XuY3dS4GHxeLy7Ssmpv`,
        onStatusChange(status: string) {
          console.log(`\x1b[32m [ngrok].onStatusChange -> ${status} \x1b[0m]`)
        },
        onLogEvent(logEventMessage: string) {
          // console.log(`[ngrok].onLogEvent -> ${logEventMessage}`);
        },
        onTerminated() {
          console.log(
            `\x1b[36m [ngrok].onTerminated -> Tunnel terminated! \x1b[0m`,
          )
          console.log(
            '\x1b[35m Suggestion: close and re-open the app. Thanks!! \x1b[0m',
          )
        },
      })
      console.log(
        `\x1b[34m [ngrok].connect -> tunnel started at: ${tunnel_url} \x1b[0m`,
      )
      return tunnel_url as string
    } catch (error: NgrokClientError | any) {
      console.log('error',error);
      
      const err_body = error.body as ErrorBody
      console.log(
        `\x1b[31m [ngrok].error -> ${JSON.stringify(err_body)} \x1b[0m `,
      )
    }
  }
  public async kill() {
    try {
      console.log('[ngrok] -> killing tunnel on app exit')

      await ngrok.kill()

      console.log('[ngrok] -> tunnel exited')
    } catch (error) {
      console.log(`[ngrok].kill -> error: ${JSON.stringify(error)}`)
    }
  }
}
export default new Ngrok()
