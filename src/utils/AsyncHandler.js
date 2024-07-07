// this asyncHandler we use many times 
const asyncHandler =(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }} 



export {asyncHandler}






// second option 
/*
const asyncHandle = (fn)=>async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500 ).json({
            success:false,
            massage:err.massage
        })
        
    }
}
*/