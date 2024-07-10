import { Router } from "express";
import { userRegister } from "../controllers/user.controlers.js";
const router = Router()
import {upload} from "../middlewares/multer.js"



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

export default router;