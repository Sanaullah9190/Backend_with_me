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

//import router 
import userRouter from './routes/user.routes.js'


//router decleartion 

app.use("/api/v2/users",userRouter)



export {app}