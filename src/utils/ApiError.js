class ApiError extends Error{
    constructor(
        statusCode,
        errors=[],
        massage="somethin is wrong",
        stack
    ){
        super(massage),
        this.statusCode = statusCode,
        this.data= null,
        this.massage = massage,
        this.errors =errors,
        this.success = false

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}