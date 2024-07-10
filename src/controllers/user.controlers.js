import {asyncHandler} from '../utils/AsyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {cloudinaryUpload} from '../utils/Cloudinary.js'
import {User} from '../models/user.model.js'
import {ApiResponce} from '../utils/ApiResponce.js'




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
    // validation
    // check the exits user from email and username
    // get the image and check for avatra validate and upload  into cloudinarry
    // create the user object
    // remove the refreshToken and password 
    // send res

    const { fullName, username ,email, password}  = req.body

    if(
        [fullName, username , email, password].some((field)=> field?.trim() =="")
    ){
        throw new ApiError(400,"All filed are reqiued")
    }

    const existUser = await User.findOne(
        {
            $or:[ {email} ,{username} ]
        }
    )

    if(existUser){
        throw new ApiError(401,"Allready register user")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    let CoverImageLocalPath 

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        CoverImageLocalPath = req.files.coverImage[0]?.path
    }

    if(!avatarLocalPath){
        throw new ApiError(404,"Avatar file is missing")
    }

    const avatar = await cloudinaryUpload(avatarLocalPath)
    const coverImage = await cloudinaryUpload(CoverImageLocalPath)

    const user = await User.create(
        {
            fullName,
            username:username.toLowerCase(),
            email,
            password,
            avatar:avatar.url,
            coverImage:coverImage?.url || ""
        }
    )

    const createdUser  = await User.findById(user._id).select(
    "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"some this is wrong in user register")
    }

    return res
    .status(200)
    .json(
        new ApiResponce(200,user,"user registered successfully")
    )

    
})

export {userRegister}