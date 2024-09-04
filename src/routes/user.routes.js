import { Router } from "express";
import { 
    
    login,
    logout,
    refreshToken,
    UpdateAccountDetail,
    UpdateAvatar,
    updateCoverimage,
    userRegister,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    watchHistory,
 } from "../controllers/user.controlers.js";
 
const router = Router()
import {upload} from "../middlewares/multer.js"
import {jwtVerify} from '../middlewares/auth.moddlewares.js'



// Unsecured router
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    userRegister
)
router.route("/login").post(login)

// secured router

router.route("/logout").post(jwtVerify,logout)

router.route("/refresh-token").post(refreshToken)

router.route("/change-password").post(jwtVerify,changeCurrentPassword)

router.route("/curent-user").post(jwtVerify,getCurrentUser)

router.route("/update-account").patch(jwtVerify,UpdateAccountDetail)

router.route("/avatar").patch(jwtVerify,upload.single("avatar"),UpdateAvatar)

router.route("/cover-image").patch(jwtVerify,upload.single("coverImage"),updateCoverimage)

router.route("/c/:username").get(jwtVerify,getUserChannelProfile)

router.route("/history").get(jwtVerify,watchHistory)


export default router;