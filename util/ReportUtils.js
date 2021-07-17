const stringMessage = require('../value/string')
const RollCallReport = require('../models/RollCallReport');
const ClassInfo = require('../models/ClassInfo');
const moment = require('moment-timezone');



function getDate(){
    moment.tz.setDefault("Asia/Ho_Chi_Minh");
    const now = moment();
    return formatDate(now);
}

function genRandomString(seed, length){
    let res = "";
    for(let i = 0; i < length; i++){
        res += seed.charAt(Math.floor(Math.random() * seed.length));
    }
    return res;
}



function formatDate(date, stringDate = "DD-MM-YYYY"){
    return moment(date).format(stringDate);
}


function genReportId(class_id, scheduleId){
    return [class_id, scheduleId, genRandomString('0123456789', 6)].join('$');
}

function isAbleCreatedReport(dateList){
    if(dateList.length > 0){
        moment.tz.setDefault("Asia/Ho_Chi_Minh");
        const shift = dateList[0].split('@')[0];
        const now = moment();
        const nowMM = shift + '@' + formatDate(moment(now, 'DD-MM-YYYY'));
        console.log(nowMM);
        console.log(dateList);
        return dateList.indexOf(nowMM);
    }
    else{
        return -1;
    }
    
}

function isAbleToCheckin(day)
{
    moment.tz.setDefault("Asia/Ho_Chi_Minh");
    const dateMM = moment('DD-MM-YYYY');
    return moment().isSame(dateMM, day);
}
function getStatusCheckin(reportInfo){
    moment.tz.setDefault("Asia/Ho_Chi_Minh");
    const now = moment();
    const limitTime = moment(reportInfo.checkinLimitTime, "HH:mm");
    const expiredTime = moment(reportInfo.expired, "HH:mm");

    if(!reportInfo.allowLate){
        expiredtime = limitTime;
    }
    if(now.isBefore(limitTime)){
        return "ontime";
    }
    else if (now.isBefore(expiredTime)){
        return "late";
    }
    else{
        return "absent";
    }

}




module.exports = {
    isAbleCreatedReport,
    genReportId,
    getDate,
    getStatusCheckin,
    isAbleToCheckin
}