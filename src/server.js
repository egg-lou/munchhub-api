const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const connectToDatabase = require('./config/db');
const config = require('./config');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');

app.use(express.json());

const port = config.port || 8080;

app.listen(port, () => {
    console.log(`Server is running at PORT: http://localhost:${port}`);
});

connectToDatabase();

app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], 
    })
);

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);

app.all('*', function (req, res) {
    res.status(404).send({ message: 'Page Not Found' });
});
