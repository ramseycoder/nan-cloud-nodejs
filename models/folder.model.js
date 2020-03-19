const mongoose = require('mongoose');

const {
    Schema
} = require('mongoose');

const FolderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    files: [{
        type: Schema.Types.ObjectId,
        ref: "file"
    }],
    shared: {
        type: Boolean,
        default: false
    },
    sharedOptions: [{
        crypt_link: String,
        path: String,
        privileges: Array,
        password: {
            type: String,
            default: null,
        },
        expirationDate: {
            type: Date,
            default: null,
        },
        message: {
            type: String,
            default: null,
        }
    }],
    size: {
        type: Number,
        default: 0,
    },
    date_creation: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('folder', FolderSchema);