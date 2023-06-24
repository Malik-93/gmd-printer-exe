import {IRolloResults} from '../interfaces/printerInterface'
import fs from 'fs'
import logger from '../logger'
import {exec} from 'child_process'
import util from 'util'

const _exec = util.promisify(exec)

export const unlinkFile = (filePath: string) => {
  fs.unlink(filePath, (err: Error | any) => {
    if (err) {
      // console.log(`An error accured while deleting the ${filePath} file ..`)
      logger.error(`An error accured while deleting the ${filePath} file ..`)
    } else {
      // console.log(`${filePath} file has been deleted..`)
      logger.info(`${filePath} file has been deleted..`)
    }
  })
}

export const get_ip_from_mac = async (mac: string): Promise<IRolloResults> => {
  let result: IRolloResults = {
    printer_ip: '',
  }

  const spliter_phrase: string = 'dynamic'
  const command = await _exec(`arp -a`)
  const {stdout} = command
  const res = stdout.toLowerCase().replace(/\s/g, '')
  const split = res.split(spliter_phrase)
  for (let i = 0; i < split.length; i++) {
    if (split[i].includes(mac)) {
      result = {
        printer_ip: split[i].replace(mac, ''),
      }
    }
  }
  return result
}

export const getCurrentMac = async (): Promise<string> => {
  const command = await _exec(`getmac /v`)
  const {stdout} = command
  const res = stdout.match(
    /Ethernet\s{3,}[\S\s]+?(?<mac>\S{2}-\S{2}-\S{2}-\S{2}-\S{2}-\S{2})/i,
  )
  if (res) {
    return res[1]
  } else {
    return ''
  }
}