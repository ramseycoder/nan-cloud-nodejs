const mongoose = require('mongoose');

const {
    Schema
} = require('mongoose');

const FileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    buffer: {
        type: String,
    },
    mimetype: {
        type: String,
    },
    type: {
        type: String,
        required: true
    },
    size: {
        type: Number,
    },
    date_creation: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('file', FileSchema);