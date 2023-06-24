export interface IRolloResults {
    printer_ip: string
}
export interface IFormPrintRequest {
    printer: string,
    copies: number,
    file: Express.Multer.File,
}
export interface IEmailJson {
    email: string
}

export interface IPrinterStatusRequest {
    printer_mac: string
}

export interface IPrinterStatusResponse {
    online: boolean,
    message?: string
}