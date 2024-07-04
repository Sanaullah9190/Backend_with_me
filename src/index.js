import dotenv from 'dotenv'
import {connectDb} from './db/index.js'


dotenv.config({
    path:'./env'
})

connectDb()











/*
import express from 'express'
const app = express()

( async()=>{
    try {
        await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log(error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`server is running at ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.log("failed to connect to database");
    }
})()
*/