const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const jwt=require('jsonwebtoken');
require('dotenv').config()
const ws=require('ws');
require("dotenv").config();

const { MessageModel }=require('./models/message.model')
const { connection } = require('./configs/mongoDB');
const { userRouter } = require("./routes/user.routes");
const { messagesRouter } = require("./routes/messages.routes");

const PORT = process.env.PORT || 4000;



const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.client_URL
}));
app.use(express.json());
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json("test OK");
})

app.use('/user', userRouter);
app.use('/messages', messagesRouter);

const server = app.listen(PORT, async () => {
    try {
        await connection
            .then(() => {
                console.log("Connected to MongoDB");
            })
    } catch (error) {
        console.log(error);
    }
    console.log(`Server is beating at PORT ${PORT}`);
})


const wss=new ws.WebSocketServer({server});
wss.on('connection',(connection, req)=>{
    
function notifyAboutOnlinePeople(){
    // notify everyone about online people (when someone connects)
   [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
        online: [...wss.clients].map(c=> ({userId: c.userId, userName:c.userName}))
    }))
})
}

    connection.isAlive=true;
    connection.timer = setInterval(()=>{
        connection.ping()
        connection.deathTimer = setTimeout(()=>{
            connection.isAlive=false;
            clearInterval(connection.timer)
            connection.terminate()
            notifyAboutOnlinePeople()
            console.log('dead')
        },1000)
    },5000)

    connection.on('pong',()=>{
        clearTimeout(connection.deathTimer);
    })


    // read username and id from the cookie fot this connection
    const cookies= req.headers.cookie
    if(cookies){
        const tokenCookieString=cookies.split(';').find(str=> str.startsWith('BubbleToken='));
        if(tokenCookieString){
            const token=tokenCookieString.split('=')[1];
            if(token){
                // console.log(token)
                jwt.verify(token, process.env.JWT_secret,(err,decoded)=>{
                    if(err) throw err;
                    const {userId,userName}=decoded;
                    connection.userId=userId;
                    connection.userName=userName;

                })
            }
        }

    }

    connection.on('message',async (msg)=>{
        const {recipient,text}=JSON.parse(msg).message
        if(recipient && text){
            const messageDoc = await MessageModel.create({
                sender: connection.userId,
                recipient,
                text
            });
            [...wss.clients]
                .filter(c=> c.userId === recipient)
                .forEach(c=>c.send(JSON.stringify({
                    text, 
                    sender: connection.userId,
                    recipient,
                    _id: messageDoc._id
                })));
        }
    });
    notifyAboutOnlinePeople()
});



