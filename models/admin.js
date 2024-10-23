const { default: mongoose } = require("mongoose")
const Mongoose=require("mongoose")

const adminSchema=Mongoose.Schema(
    {
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },


    }
)

var adminModel= Mongoose.model("admin",adminSchema)
module.exports=adminModel