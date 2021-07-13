const stringMessage = require('../value/string')
const ClassInfo = require('../models/ClassInfo');

function formatDate(date, stringDate = "DD/MM/YYYY"){
    return moment(date).format(stringDate);
}

function currentDate(){
    return formatDate(moment());
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


module.exports = {
    currentDate,
    formatDate,
    createBaseClassInfo
}