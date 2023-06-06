const express = require('express');
require('dotenv').config();
const { UserModel } = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRouter = express.Router();
const {getUserDataFromRequest:userData} =require('../middlewares/getUserDataFromRequest.middleware')

userRouter.get('/people', async (req,res)=>{
    const users= await UserModel.find({}, {'_id':1, userName: 1, })
    res.status(200).json(users);
}); 

userRouter.get("/profile",userData, (req,res)=>{
    if(req.userData){
        res.status(200).json(req.userData)
    }else{
        res.status(401).json('no token')
    }
    
})
userRouter.post('/register', async (req, res) => {
    try {
        const { userName, email, password } = req.body

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(202).json("User already exists, Please Login")
        }

        const hashedPass = bcrypt.hashSync(password, 5);
        const user = new UserModel({ email, userName, password: hashedPass })
        user.save();
        jwt.sign({ userId: user._id, userName }, process.env.JWT_secret, (err, token) => {
            if (err) {
                throw err
            } else {
                res.cookie("BubbleToken", token, {sameSite: 'none', secure:true, domain: 'netlify.app'}).status(201).json({
                    msg:'User created successfully, Logging In...',
                    _id: user._id,
                    userName: user.userName
                })
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send("Something went wrong")
    }
})


userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json( "User not found" )
        }

        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(401).json("Wrong Password")
        }

        jwt.sign({ userId: user._id, userName:user.userName }, process.env.JWT_secret, (err, token) => {
            if (err) {
                throw err
            } else {
                res.cookie("BubbleToken", token, {sameSite: 'none', secure:true}).status(201).json({
                    msg:'Login Success',
                    _id: user._id,
                    userName: user.userName
                })
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json("Something went wrong")
    }
})


userRouter.post('/logout', async (req, res) => {
    res.cookie("BubbleToken", '', {sameSite: 'none', secure:true}).status(201).json('logged out')
})

module.exports = {
    userRouter
}