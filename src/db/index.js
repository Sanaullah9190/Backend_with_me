import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'
import express from 'express'
const app = express()


const connectDb =  async()=>{
    try {
        const conectionIntance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        console.log("MONGODB connect successfully", conectionIntance.connection.host);
    } catch (error) {
        console.log("failed to connect DataBase");
        process.exit()
    }
}

export {connectDb}