import mongoose from 'mongoose'

const userSchema=mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number},
    role:{type:String,enum:["Client","Admin","Owner"],default:"Client"},
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
},{timestamps:true})

export default mongoose.model('User',userSchema)