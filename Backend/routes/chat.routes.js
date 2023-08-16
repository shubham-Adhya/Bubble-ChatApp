const express = require('express');

const chatRouter = express.Router();
const { UserModel } = require('../models/user.model')
const { ChatModel } = require("../models/chat.model")
const { getUserDataFromRequest: userData } = require('../middlewares/getUserDataFromRequest.middleware')

chatRouter.use(userData)

// Access Chat
chatRouter.post('/', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        // console.log("UserId Param not sent with request")
        return res.status(400).json({ message: "UserId Param not sent with request" })
    }

    let isChat = await ChatModel.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.userData.userId } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password").populate("latestMessage")

    isChat = await UserModel.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })

    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.userData.userId, userId]
        }
        try {
            const createdChat = await ChatModel.create(chatData);
            const FullChat = await ChatModel.findOne({ _id: createdChat._id }).populate("users", "-password")
            res.status(200).send(FullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
})

// Fetch Chats
chatRouter.get('/', async (req, res) => {
    try {
        ChatModel.find({ users: { $elemMatch: { $eq: req.userData.userId } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await UserModel.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email"
                })
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

// Create Group Chat 
chatRouter.post('/group', async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" })
    }

    let users = JSON.parse(req.body.users)
    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat")
    }
    users.push(req.userData.userId)

    try {
        const groupChat = await ChatModel.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.userData.userId
        })
        const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        return res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

//Rename Group
chatRouter.put('/rename', async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await ChatModel.findByIdAndUpdate(chatId, { chatName }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updatedChat) {
        return res.status(404).json({ message: "Chat not found" });
        // throw new Error("Chat not found")
    } else {
        return res.status(200).json(updatedChat);
    }
})

// Add to group
chatRouter.put('/groupadd', async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await ChatModel.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    
    if (!added) {
        return res.status(404).json({ message: "Chat not found" });
    } else {
        return res.status(200).json(added);
    } 
})

//Remove from group
chatRouter.put('/groupremove', async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await ChatModel.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        return res.status(404).json({ message: "Chat not found" });
    } else {
        return res.status(200).json(removed);
    } 

})

module.exports = {
    chatRouter
}