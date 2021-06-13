const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const User = require('./User');

const reportschema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    contend: [{
        user: {
            type: User,
            require: true
        },
        status: {
            type: Int32,
            require: true
        }
    }]
})

const rollcallreport = mongoose.model('RollCallReport', reportschema);

module.exports = rollcallreport;