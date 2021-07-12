const { integer } = require('mongodb');
const mongoose = require('mongoose');
const classRoom = require('./ClassRoom');
const User = require('./User');

/**
 * @typedef Class
 * @property {string} id.required
 * @property {string} name.required
 * @property {User.model} teacher.required
 * @property {string} room.required
 * @property {Array.<User>} students.required
 * @property {Array.<User>} monitors.required
 * @property {integer} credit.required
 * @property {enum} dayOfWeek.required  - Một trong các giá trị sau đây: - eg: 2, 3, 4, 5, 6, 7
 * @property {enum} shift.required - Một trong các giá trị sau đây: - eg: 0, 1
 * @property {integer} days.required
 * @property {date} dayStart.required
 */



const classInfoSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        require: true
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    credit: {
        type: Number,
        required: true,
    },
    room: {
        type: String,
        require: true,
    },
    monitors: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        require: true
    }],

    
    // schedule
    dateStart: {
        type: Date,
        required: true,
    },
    shift: {
        type: Number,
        require: true,
    },
    dayOfWeek: {
        type: Number,
        required: true,
    },
    days: {
        type: Number,
        required: true,
    },
})

//
const ClassInfo = mongoose.model('ClassInfo', classInfoSchema)

module.exports = ClassInfo