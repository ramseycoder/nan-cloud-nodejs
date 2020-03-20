const mongoose = require('mongoose');

const {
    Schema
} = require('mongoose');

const AdminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "admin"
    }
})

module.exports = mongoose.model('admin', AdminSchema);