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
        type: Buffer,
    },
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
    date_creation: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('file', FileSchema);