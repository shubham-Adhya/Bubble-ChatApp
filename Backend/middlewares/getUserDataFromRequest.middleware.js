const jwt = require('jsonwebtoken')
require('dotenv').config();

async function getUserDataFromRequest(req,res,next){
    const token= req.cookies?.BubbleToken;
    if(token){
        jwt.verify(token, process.env.JWT_secret, (err, decoded)=>{
            if(err) throw err;
            // res.status(200).json(decoded)
            req.userData=decoded
        })
    }
    next()
}
 module.exports={
    getUserDataFromRequest
 }