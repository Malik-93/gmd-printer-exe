import ngrok, {NgrokClientError, ErrorBody} from 'ngrok'
import logger from '../logger'
import {port} from '../constants'
class Ngrok {
  public async init(): Promise<string | undefined> {
    try {
      logger.info(`[ngrok] -> Initializing tunnel...`)
      console.log(`\x1b[33m [ngrok] -> Initializing tunnel... \x1b[0m`)
      const tunnel_url = await ngrok.connect({
        proto: 'http',
        addr: port,
        region: `us`,

        onStatusChange(status: string) {
          console.log(`\x1b[32m [ngrok].onStatusChange -> ${status} \x1b[0m]`)
          logger.info(`[ngrok].onStatusChange -> ${status}`)
        },
        onLogEvent(logEventMessage: string) {
          // console.log(`[ngrok].onLogEvent -> ${logEventMessage}`);
          logger.info(`[ngrok].onLogEvent -> ${logEventMessage}`)
        },
        onTerminated() {
          console.log(
            `\x1b[36m [ngrok].onTerminated -> Tunnel terminated! \x1b[0m`,
          )
          logger.info(`[ngrok].onTerminated -> Tunnel terminated!`)
          console.log(
            '\x1b[35m Suggestion: Please close and re-open the app. Thanks!! \x1b[0m',
          )
        },
      })
      logger.info(`[ngrok].connect -> tunnel started at: ${tunnel_url}`)
      console.log(
        `\x1b[34m [ngrok].connect -> tunnel started at: ${tunnel_url}] \x1b[0m`,
      )
      return tunnel_url as string
    } catch (error: NgrokClientError | any) {
      const err_body = error.body as ErrorBody
      logger.error(`[ngrok].error -> ${JSON.stringify(err_body)}`)
      console.log(
        `\x1b[31m [ngrok].error -> ${JSON.stringify(err_body)} \x1b[0m `,
      )
    }
  }
  public async kill() {
    try {
      console.log('[ngrok] -> killing tunnel on app exit')
      logger.info('[ngrok] -> killing tunnel on app exit')

      await ngrok.kill()

      console.log('[ngrok] -> tunnel exited')
      logger.info('[ngrok] -> tunnel exited')
    } catch (error) {
      logger.error(`[ngrok].kill -> error: ${JSON.stringify(error)}`)
      console.log(`[ngrok].kill -> error: ${JSON.stringify(error)}`)
    }
  }
}
export default new Ngrok()
