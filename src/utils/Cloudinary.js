import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

const cloudinaryUpload = async (localpath)=>{
    try {
        if(!localpath) return null;
        const response = await cloudinary.uploader.upload(localpath,{
            resource_type:"auto"
        });
        fs.unlinkSync(localpath);// upload file is deleted
        // console.log(response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localpath) // upload file is deleted
        return null;
    }

}

export {cloudinaryUpload}