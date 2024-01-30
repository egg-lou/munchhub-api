const mongoose = require('mongoose');
const config = require('../config')

const connectToDatabase = () => {
    mongoose.set('strictQuery', false);
    mongoose
        .connect(config.mongoUrl)
        .then(() => {
            console.log('Connected to Munchub MongoDB Database');
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports = connectToDatabase;
