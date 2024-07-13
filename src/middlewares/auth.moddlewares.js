import jwt  from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const jwtVerify = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(404,"unauthorized access")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN)
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user){
            throw new ApiError(404,"access token has been expired")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.massage ||"access token expired")
    }
})