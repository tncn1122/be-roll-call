const stringMessage = require('../value/string')
const ClassInfo = require('../models/ClassInfo');
const moment = require('moment-timezone') 


const week = {
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'thursday',
    6: 'Friday',
    7: 'Saturday',
}

async function findClass(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('students').populate('monitors');
    return classInfo;
}

function validateDate(date){
    try{
        return moment(date, 'DD-MM-YYYY', true).isValid();
    }
    catch(err){
        throw new Error(stringMessage.date_wrong);
    }
}


function validateDays(days){
    if(days <= 0){
        throw new Error(stringMessage.days_wrong);
    }
}

function formatDate(date, stringDate = "DD-MM-YYYY"){
    return moment(date).format(stringDate);
}

function currentDate(){
    return formatDate(moment());
}

function isChangeExpired(startDate){
    moment.tz.setDefault("Asia/Ho_Chi_Minh");
    const now = moment();
    const startDateMM = moment(startDate, 'DD-MM-YYYY');
    return (now.isSameOrAfter(startDateMM));
}



function genSchedule(startDate, shift, days, dayOfWeek){
    let schedule = [];
    //console.log(startDate);
    let day = moment(startDate, 'DD-MM-YYYY');
    while(day.format('dddd') !== week[dayOfWeek]){
        day.add(1, 'days');
    }
    for (let times = 0; times < days; times++){
        schedule.push(shift + '@' + formatDate(day));
        day.add(7, 'days');
    }
    return schedule;
}

function createBaseClassInfo(classInfo){
    return {
        id: classInfo.id || "",
        name: classInfo.name || "",
        room: classInfo.room || "",
        credit: classInfo.credit || 0,
        dayOfWeek: classInfo.dayOfWeek || "2",
        shift: classInfo.shift || '0',
        days: classInfo.days || 0,
        dateStart: classInfo.dateStart || currentDate()
    };
}

async function createListClass(classIdList){
    let class_list = [];

    if (classIdList){
        for (const class_id of classIdList){
            let classInfo = await ClassInfo.findOne({id: class_id.id});
            if(!classInfo){
                throw new Error(stringMessage.class_not_found + " Lớp: " + class_id);
            }
            class_list.push(classInfo);
        }
    }
    return class_list;
}


module.exports = {
    currentDate,
    formatDate,
    createBaseClassInfo,
    createListClass,
    findClass,
    genSchedule,
    isChangeExpired,
    validateDate,
    validateDays
}