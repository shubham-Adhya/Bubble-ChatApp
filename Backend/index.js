const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config()

const { connection } = require('./configs/mongoDB');
const { notFound } = require('./middlewares/error.middleware')
const { userRouter } = require("./routes/user.routes");
const { chatRouter } = require("./routes/chat.routes");


const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.client_URL
}));

app.use(express.json());
app.use(cookieParser())



app.get('/', (req, res) => {
    res.status(200).json("Bubble ChatApp Server is running 👍");
})

app.use('/user', userRouter);
app.use('/chat', chatRouter);

app.use(notFound)

const server = app.listen(PORT, async () => {
    try {
        await connection
            .then(() => {
                console.log('\x1b[33m%s\x1b[0m', "Connected to MongoDB");
            })
    } catch (error) {
        console.log(error);
    }
    console.log('\x1b[33m%s\x1b[0m', `Server is beating at PORT ${PORT}`);
})






