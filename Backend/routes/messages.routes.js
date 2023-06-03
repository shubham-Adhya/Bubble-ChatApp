const express = require('express');
require('dotenv').config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const messagesRouter = express.Router();
const { MessageModel } = require('../models/message.model')
const {getUserDataFromRequest:userData} =require('../middlewares/getUserDataFromRequest.middleware')

messagesRouter.get('/:userId',userData,async(req,res)=>{
    const {userId: receiverUserId} = req.params;
    const {userId: ourUserId}=req.userData;

    const messages = await MessageModel.find({
        sender: {$in: [receiverUserId,ourUserId] },
        recipient: {$in: [receiverUserId,ourUserId]}
    }).sort({createdAt: 1});
    res.status(200).json(messages)
})

module.exports={
    messagesRouter
}