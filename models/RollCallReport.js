const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const User = require('./User');

/**
 * @typedef UserReport
 * @property {User.model} user.require
 * @property {enum} status.require - 0 là chưa điểm danh (vắng), 1 là điểm danh hợp lệ, 2 là điểm danh muộn. - eg: integer:0,1,2
 */
/**
 * @typedef Report
 * @property {string} id.require
 * @property {Array.<UserReport>} user.require
 */

const reportschema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    content: [{
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