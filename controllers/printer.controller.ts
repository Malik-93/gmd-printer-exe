import {get_ip_from_mac, unlinkFile} from '../utils'
import fs from 'fs'
import {FullRequest, FullResponse, Printer} from 'ipp'
import {Route, Post, Tags, FormField, UploadedFile, Body, Example} from 'tsoa'
import {IPrinterStatusRequest, IPrinterStatusResponse} from './../interfaces/printerInterface';
@Tags('Printer')
@Route('/api/printer')
class PrinterController {
  @Post('/print')
  public print(
    @FormField() _printer: string,
    @FormField() copies: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const message = this.print_request_validator(_printer, file)
      if (message.length)
        return resolve({
          success: false,
          statusCode: 400,
          message,
        })

      const filePath = `${file.path}`
      const printCount = copies || 1

      try {
        fs.readFile(
          filePath,
          async function (err: NodeJS.ErrnoException | null, data: Buffer) {
            if (err) {
              console.log(
                `\x1b[31m __[fs.readFile]__ An error accured: ${JSON.stringify(err)} \x1b[0m`
              )
              reject(err)
            }

            let dest_printer_ip = _printer

            if (!dest_printer_ip.includes('.')) {
              const {printer_ip} = await get_ip_from_mac(_printer)

              if (!printer_ip){
                console.log(
                  `\x1b[31m ${dest_printer_ip} Printer not found! \x1b[0m`,
                  )
                  return resolve({
                    success: false,
                    statusCode: 404,
                    message: `Printer not found!`,
                  })
              }

              dest_printer_ip = printer_ip
            }

            const printer_uri = dest_printer_ip.includes('http') ? dest_printer_ip : `http://${dest_printer_ip}:631`
            
            const printer = new Printer(printer_uri, {
              uri: printer_uri,
              version: '1.0',
            })
            const msg: FullRequest = {
              'job-attributes-tag': {
                copies: printCount,
              },
              'operation-attributes-tag': {
                'requesting-user-name': 'Azure',
                'job-name': 'Automatic Print Job',
                'document-format': 'application/pdf',
              },
              data: data,
            }
            printer.execute(
              'Print-Job',
              msg,
              (err: Error, _res: FullResponse) => {
                if (err) {
                  console.log(
                    `\x1b[31m __[printer.execute]__ An error accured: ${JSON.stringify(err)} \x1b[0m`,
                    )
                  reject(err)
                } else {
                  console.log(
                   `\x1b[32m Print request has been sent to the printer successfully -> ${printer_uri} \x1b[0m`,
                    )
                  resolve({
                    success: true,
                    statusCode: 200,
                    message: `Print request has been sent to the printer successfully -> ${printer_uri}`,
                    _res,
                  })
                }
              },
            )
          },
        )
      } catch (error) {
        reject(error)
      } finally {
        unlinkFile(filePath)
      }
    })
  }
  @Example(<IPrinterStatusRequest>{
    printer_mac: 'a1:b2:c3:d4:e5:f6'
  })
  @Post('/status')
  public printer_status(@Body() _body: IPrinterStatusRequest): Promise<IPrinterStatusResponse> {
    const { printer_mac } = _body;
    let online: boolean = true,
        message:string = 'Printer is online';
    let result: IPrinterStatusResponse = {online, message}
    return new Promise(async (resolve, reject) => {
      try {
        if(!printer_mac || !printer_mac.length) result = {online: false, message: 'Printer mac address is required'};
        const {printer_ip} = await get_ip_from_mac(printer_mac);
        if (!printer_ip.length) result = {online: false, message: "Printer is offline!"};
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })
  }
  private print_request_validator(
    printer: string,
    file: Express.Multer.File,
  ): string {
    let message: string = ''
    if (!printer && (!file || !file.path)) {
      message = 'Printer mac address and pdf file is required!!'
    } else if (!printer) {
      message = 'Printer mac address is required!!'
    } else if (!file || !file.path) {
      message = 'PDF file is required!!'
    }
    return message
  }
}

export default new PrinterController()
