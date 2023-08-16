const jwt = require('jsonwebtoken')
require('dotenv').config();

async function getUserDataFromRequest(req, res, next) {
    const token = req.cookies?.BubbleToken;
    if (!token) {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.JWT_secret, (err, decoded) => {
        if (!err){
            req.userData = decoded
            next()
        }else{
            res.sendStatus(401)
        }

    })
}
module.exports = {
    getUserDataFromRequest
}