import express, { urlencoded } from 'express'
const app = express()
import cookieParser from 'cookie-parser'
import cores from 'cors'



// Middlewares
app.use(cores({
    origin:process.env.CORES,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



export {app}