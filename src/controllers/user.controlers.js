import {asyncHandler} from '../utils/AsyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {cloudinaryUpload} from '../utils/Cloudinary.js'
import {User} from '../models/user.model.js'
import {ApiResponce} from '../utils/ApiResponce.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'





const GenarateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save(
            {
                validateBeforeSave:false,
            }
        )
        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500, "some thing is error in accesToken and RefreshTpken Genaretd")
    }
}

const userRegister = asyncHandler(async(req,res)=>{
    // get the data from body
    // validate 
    // find the user by email or username
    // validate the avatar 
    // upload the files in cloudinary 
    // create the user object
    // remove the password and refreshToken
    // send the res

    const {fullName , username , email, password } = req.body;

    if(
        [fullName ,username , email, password].some((field)=>field?.trim() =="")
    ){
        throw new ApiError(404,"All fileds is required")
    }

    const existedUser = await User.findOne({
        $or:[{username} , {email}]
    })

    if(existedUser){
        throw new ApiError(409,"user are allready resister by email and uasername")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path 
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required ")
    }

    const avatar = await cloudinaryUpload(avatarLocalPath)
    const coverImage = await cloudinaryUpload(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is missing")
    }

    const user = await User.create(
        {
            username:username.toLowerCase(),
            email,
            password,
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || ""
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"some thing is error in the refreshToken and AccessToken genarating")
    }

    return res
    .status(200)
    .json(
        new ApiResponce(200,createdUser,"user registerd Successfull")
    )

})

const login = asyncHandler(async(req,res)=>{
    // get data from the body
    // validate
    // find user
    // check password
    // create accessToken and refresh Token
    // retern res

    const {username, email ,password} = req.body

    // if(!username || !email){
    //     throw new ApiError(400,"uername and email is required")
    // }

    if(!(username || email)){
        throw new ApiError(400,"uername and email is required")
    }

    const user = await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user does not exits")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"password is incorrect")
    }

    const {accessToken , refreshToken} = await GenarateAccessTokenAndRefreshToken(user._id)

    const loggeInUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponce(200,
        {
            user:loggeInUser,accessToken,refreshToken
        },
        "user logged successfully")
    )
})

const logout = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1,
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponce(200,{},"user logout successfull")
    )
})

const refreshToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    try {
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized access")
        }
    
        const decodetToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN)
    
        const user = await User.findById(decodetToken?._id)
    
        if(!user){
            throw new ApiError(404,"refreshToken is expired")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(404,"refreshToken is expired")
        }
    
        const {accessToken, newrRefreshToken } = await GenarateAccessTokenAndRefreshToken(user._id)
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrRefreshToken,options)
        .json(
            new ApiResponce(200,
                {
                    accessToken , refreshToken:newrRefreshToken,
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(200,"refresh token refresh failed ")
    }

   
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    if(!(oldPassword && newPassword)){
        throw new ApiError(400,"all field are required")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorect =  await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorect){
        throw new ApiError(404,"password is invalid")
    }

    user.password = newPassword
    await user.save({
        validateBeforeSave:false
    })

    return res
    .status(200)
    .json(new ApiResponce(200,{},"password change succesfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponce(200,req.user,"current user fatched succesfully"))
})

const UpdateAccountDetail =asyncHandler(async(req,res)=>{
    const {fullName , email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fileds are required ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json( new ApiResponce(200,user,"Account deatil are changed"))
})

const UpdateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(404,"avatar is not found")
    }

    const avatar = await cloudinaryUpload(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error on ulplodin on avatr")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiError(200,user,"avatar update sucessfull"))
})

const updateCoverimage = asyncHandler(async(req,res)=>{
    const coverLocalPath = req.file?.path

    if(!coverLocalPath){
        throw new ApiError(404,"coverImage is not found ")
    }

    const coverImage = await cloudinaryUpload(coverLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error on updating in the coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiError(200,user,"coverImage update sucessfull"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponce(200, channel[0], "User channel fetched successfully")
    )
})

const watchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponce(200,user[0].watchHistory,"watchHistory fatched sucessfully")
    )
})



export {
    userRegister,
    login,
    logout,
    refreshToken,
    changeCurrentPassword,
    getCurrentUser,
    UpdateAccountDetail,
    UpdateAvatar,
    updateCoverimage,
    getUserChannelProfile,
    watchHistory,
}