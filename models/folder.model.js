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

module.exports = mongoose.model('folder', FolderSchema);