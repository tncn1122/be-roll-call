const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const classRoom = require('./ClassRoom');
const User = require('./User');


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
        type: User,
        require: true
    }],
    teacher: {
        type: User,
        required: true,
    },
    credit: {
        type: Int32,
        required: true,
    },
    room: {
        type: String,
        require: true,
    },
    monitors: [{
        type: User,
        require: true
    }],

    
    // schedule
    dateStart: {
        type: Date,
        required: true,
    },
    shift: {
        type: Int32,
        require: true,
    },
    dayOfWeek: {
        type: Int32,
        required: true,
    },
    days: {
        type: Int32,
        required: true,
    },
})

//
const ClassInfo = mongoose.model('ClassInfo', classInfoSchema)

module.exports = ClassInfo