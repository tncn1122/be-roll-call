const stringMessage = require('../value/string')
const ClassInfo = require('../models/ClassInfo');
const moment = require('moment') 

async function findClass(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('students').populate('monitors');
    return classInfo;
}

function formatDate(date, stringDate = "DD-MM-YYYY"){
    return moment(date).format(stringDate);
}

function currentDate(){
    return formatDate(moment());
}

function isChangeExpired(startDate){
    const now = moment();
    const startDateMM = moment(startDate, 'DD-MM-YYYY');
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
    findClass
}