import {IFormPrintRequest, IPrinterStatusRequest} from './../interfaces/printerInterface';
import express, {Request, Response, Router} from 'express'
import upload from '../multer/upload'
import logger from '../logger'
import printerController from '../controllers/printer.controller'
const router: Router = express.Router();

router.post(
  '/print',
  upload('uploads').single('file'),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as IFormPrintRequest;
      const result = await printerController.print(body.printer, body.copies, req.file as Express.Multer.File)
      return res.status(200).json(result)
    } catch (error) {
      console.log(`\x1b[31m __[printer.execute]__ An error accured: ${error} \x1b[0m`)
      logger.error({
        endpoint: '/api/printer/print',
        error,
      })
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Ooops! Something went wrong...',
        error,
      })
    }
  },
);

router.post(
  '/status',
  async (req: Request, res: Response) => {
    try {
      const result = await printerController.printer_status(req.body as IPrinterStatusRequest);
      return res.status(200).json(result)
    } catch (error) {
      console.log(`\x1b[31m Printer get status error ->: ${error} \x1b[0m` )
      logger.error({
        endpoint: '/api/printer/status',
        error,
      })
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Ooops! Something went wrong...',
        error,
      })
    }
  })


export = router;
