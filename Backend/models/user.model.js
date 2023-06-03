const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    userName: {
        type: String
    },
    password: String,

},{
    versionKey: false,
    timestamps: true
})

const UserModel=mongoose.model("user",userSchema)

module.exports={
    UserModel
}