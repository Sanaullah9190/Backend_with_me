import { Router } from "express";
import { login, logout, refreshToken, userRegister } from "../controllers/user.controlers.js";
const router = Router()
import {upload} from "../middlewares/multer.js"
import {jwtVerify} from '../middlewares/auth.moddlewares.js'



// router 
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
router.route("refresh-token").post(refreshToken)

export default router;