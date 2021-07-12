const { integer } = require('mongodb');
const mongoose = require('mongoose');
const User = require('./User');

/**
 * @typedef UserReport
 * @property {User.model} user.required
 * @property {enum} status.require - 0 là chưa điểm danh (vắng), 1 là điểm danh hợp lệ, 2 là điểm danh muộn. - eg: integer:0,1,2
 */
/**
 * @typedef RollCallReport
 * @property {string} id.required
 * @property {string} subject_id.required
 * @property {Array.<UserReport>} user.required
 */

const reportschema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    subject: {
        type: String,
        require: true,
        trim: true
    },
    content: [{
        user: {
            type: User,
            require: true
        },
        status: {
            type: string,
            enum: {
            values: ['late', 'ontime', 'absent'],
            message: "Trạng thái không đúng!"
            },
            require: true
        }
    }]
})

const rollcallReport = mongoose.model('RollCallReport', reportschema);

module.exports = rollcallReport;