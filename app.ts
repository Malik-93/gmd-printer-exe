import express, {Application, Request, Response} from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './router'
import errorHandler from './middlewares/error.handler'

dotenv.config()
const app: Application = express()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static('public'))
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(errorHandler)
app.use(router)
export default app
