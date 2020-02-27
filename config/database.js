const mongoose = require('mongoose');

const connection = async () => {
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/nanCloud', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        }, );
        console.log('connected to mongodb');

    } catch (e) {
        console.log('an error occured', e);
    }
}

module.exports = connection;