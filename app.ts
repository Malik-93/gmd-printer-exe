import express, { Application, Request, Response } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import router from './router'
import bodyParser from 'body-parser'
dotenv.config()
const app: Application = express();
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/files', router)
app.get('/', (req: Request, res: Response) => res.send('Printer exe app is up and running...'));
export default app;
