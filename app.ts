import express, {Application, Request, Response} from 'express'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()
const app: Application = express()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/', (req: Request, res: Response) => res.send('Printer exe app is up and running...'));
app.use('/update', (req: Request, res: Response) => res.status(200).json({available: true, message:'A new update is available'}));
export default app;
