const mongoose=require('mongoose');

const messageSchema=mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    text: String

},{
    timestamps: true,
    versionKey: false
})

const MessageModel=mongoose.model("message",messageSchema)

module.exports={
    MessageModel
}