class ApiError extends Error{
    constructor(
        statusCode,
        massage="some thing is error",
        errors=[],
        stack =""
    ){
        super(massage)
        this.statusCode = statusCode
        this.data= null
        this.errors =errors
        this.massage = massage
        this.success = false

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}