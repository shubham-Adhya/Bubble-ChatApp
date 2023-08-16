const express = require('express');
require('dotenv').config();
const { UserModel } = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRouter = express.Router();
const { getUserDataFromRequest: userData } = require('../middlewares/getUserDataFromRequest.middleware')



userRouter.get("/profile", userData, async (req, res) => {
    if (req.userData) {
        // console.log(req.userData)
        const { email } = req.userData
        const user = await UserModel.findOne({ email });
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic
        })
    } else {
        res.status(401).json('no token')
    }
})
userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, pic } = req.body
        if (!name || !email || !password) {
            return res.status(403).json("Missing Data Fields...")
        }
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(202).json("User already exists, Please Login")
        }

        const hashedPass = bcrypt.hashSync(password, 5);
        let userInfo
        if(pic){
             userInfo = { email, name, password: hashedPass, pic }
        }else{
             userInfo = { email, name, password: hashedPass }
        }
        const user = new UserModel(userInfo)
        user.save()
        jwt.sign({ userId: user._id, name, email }, process.env.JWT_secret, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                throw err
            } else {
                res.cookie("BubbleToken", token, { sameSite: 'none', secure: true }).status(201).json({
                    msg: 'User created successfully, Logging In...',
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: user.pic
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
            return res.status(401).json("User not found")
        }

        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(401).json("Wrong Password")
        }

        jwt.sign({ userId: user._id, name: user.name, email }, process.env.JWT_secret, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                throw err
            } else {
                res.cookie("BubbleToken", token, { sameSite: 'none', secure: true }).status(201).json({
                    msg: 'Login Success',
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: user.pic
                })
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json("Something went wrong")
    }
})
userRouter.get('/', userData, async (req, res) => {
    // {
    //     userId: '64d775778dad3d2b68f31a0a',
    //     name: 'Shubham Adhya',
    //     email: 'shubhamadhya@gmail.com',
    //     iat: 1691849621,
    //     exp: 1691936021
    // }

    const search = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {}
    const users = await UserModel.aggregate([
        {
            $match: search
        },
        {
            $match: { _id: { $ne: req.userData.userId } }
        },
        {
            $project: {
                _id: 1, email: 1, name: 1, pic: 1
            }
        }
    ])
    return res.status(200).json({
        searchResult: users
    })

})

userRouter.post('/logout', async (req, res) => {
    res.cookie("BubbleToken", '', { sameSite: 'none', secure: true }).status(201).json('logged out')
})

module.exports = {
    userRouter
}