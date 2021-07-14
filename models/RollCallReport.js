const { integer } = require('mongodb');
const mongoose = require('mongoose');
const User = require('./User');
const reportUtil = require('../util/ReportUtils');
const QR = require('../util/QR');

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
 * @property {string} qrUrl
 * @property {string} date
 * @property {string} expired.required
 * @property {string} checkinLimitTime.required
 * @property {boolean} allowLate.required
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
            type: mongoose.Schema.Types.ObjectId, ref: 'User',
            require: true
        },
        status: {
            type: String,
            enum: {
            values: ['late', 'ontime', 'absent'],
            message: "Trạng thái không đúng!"
            },
            require: true
        }
    }],
    qrUrl: {
        type: String
    },
    date: {
        type: String
    },
    expired: {
        type: String,
        require: true
    },
    checkinLimitTime:{
        type: String,
        require: true
    },
    allowLate:{
        type: Boolean,
        required: true
    }
})

reportschema.pre('save', function(next){
    const report = this;
    report.qrUrl = QR.createQR(report.id);
    report.date = reportUtil.getDate();
    next();
})

const rollcallReport = mongoose.model('RollCallReport', reportschema);

module.exports = rollcallReport;