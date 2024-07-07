import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from 'mongoose-paginate-v2'

const vidioSchema = new Schema(
    {
        videoFile:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,
            required:true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
            
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number,
            required:true,
        },
        views:{
            type:true.valueOf,
            default:0,
        },
        isPublished:{
            type:Boolean,
            default:true,
        },

    },
    {
        timestamps:true,
    }
)

vidioSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("Video",vidioSchema)

export {Video}