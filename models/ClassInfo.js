const { integer } = require('mongodb');
const mongoose = require('mongoose');
const classRoom = require('./ClassRoom');
const User = require('./User');
const classUtil = require('../util/ClassUtils')



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
 * @property {string} schedule
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
    schedule:[{
        type: String
    }]
})


classInfoSchema.pre('save', function(next){
    const classInfo = this;
    classUtil.validateDays(classInfo.days);
    classUtil.validateDate(classInfo.dateStart);
    classInfo.schedule = classUtil.genSchedule(classInfo.dateStart, +
        classInfo.shift, classInfo.days, classInfo.dayOfWeek);
    
    next()  
})


classInfoSchema.pre('remove', async function (next) {
    // remove class in user
    //console.log("start remove pre");
    const classinfo = await findClass(this.id);
    await updateUserClass(classinfo.teacher.id, 0, classinfo.id);
    for (const user of classinfo.monitors){
        //console.log(user);
        await updateUserClass(user.id, 0, classinfo.id);
    }
    for (const user of classinfo.students){
        await updateUserClass(user.id, 0, classinfo.id);
    }
    //console.log("done remove pre");
    next()
})


async function updateUserClass(teacher_id, state, class_id){
    let current_user = await User.findOne({id: teacher_id});
    if (state == 1){
        // add class
        current_user.classes.push(class_id);
    }
    else{
        // remove class
        current_user.classes = current_user.classes.filter(item => item !== class_id);
    }
    await User.findOneAndUpdate({id: teacher_id}, current_user, function(error, raw){
        if(!error){
            if(raw){
                //console.log(raw);
                raw.save();
            }
            else{
                throw new Error(stringMessage.user_not_found);
            }
        }
        else{
            throw new Error(ResponseUtil.makeMessageResponse(error.message))
        }
    });
}

async function findClass(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('students').populate('monitors').populate('teacher');
    return classInfo;
}



//
const ClassInfo = mongoose.model('ClassInfo', classInfoSchema)

module.exports = ClassInfo