const mongoose = require('mongoose');

const {
    Schema
} = require('mongoose');

const FileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    buffer: Buffer,
    mimetype: {
        type: String,
    },
    type: {
        type: String,
        required: true
    },
    folder_id: {
        type: String
    },
    size: {
        type: Number,
    },
    shared: {
        type: Boolean,
        default: false
    },
    sharedOptions: [{
        crypt_link: String,
        privileges: Array,
        password: String,
        expirationDate: Date,
        message: String
    }],
    date_creation: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('file', FileSchema);