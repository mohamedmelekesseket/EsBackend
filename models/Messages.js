import mongoose from 'mongoose'

const messageSchema=mongoose.Schema({
    email:{type:String,required:true},
    Message:{type:String,required:true},
    phoneNumber:{type:Number},
},{timestamps:true})

export default mongoose.model('Message',messageSchema)