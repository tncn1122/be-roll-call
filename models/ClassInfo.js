const { integer } = require('mongodb');
const mongoose = require('mongoose');
const classRoom = require('./ClassRoom');
const User = require('./User');



/**
 * @typedef UserClass
 * @property {string} id.required
 */

/**
 * @typedef ClassInput
 * @property {string} id.required
 * @property {string} name.required
 * @property {UserClass.model} teacher.required
 * @property {string} room.required
 * @property {Array.<UserClass>} students.required
 * @property {Array.<UserClass>} monitors.required
 * @property {integer} credit.required
 * @property {enum} dayOfWeek.required  - Một trong các giá trị sau đây: - eg: 2, 3, 4, 5, 6, 7
 * @property {enum} shift.required - Một trong các giá trị sau đây: - eg: 0, 1
 * @property {integer} days.required
 * @property {string} dateStart.required
 */


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
 * @property {string} dateStart.required
 */



const classInfoSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        minLength: 3,
        trim: true
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        require: true
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        require: true
    },
    credit: {
        type: Number,
        required: true,
    },
    room: {
        type: String,
        minLength: 3,
        require: true,
    },
    monitors: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        require: true
    }],

    
    // schedule
    dateStart: {
        type: String,
        required: true,
    },
    shift: {
        type: String,
        require: true,
        enum: {
            values: ['0', '1'],
            message: "Buổi không đúng!"
        },
        default: 0,
    },
    dayOfWeek: {
        type: String,
        required: true,
        enum: {
            values: ['2', '3', '4', '5', '6', '7'],
            message: "Ngày không đúng!"
        },
        default: 0,
    },
    days: {
        type: Number,
        required: true,
    },
})


//
const ClassInfo = mongoose.model('ClassInfo', classInfoSchema)

module.exports = ClassInfo