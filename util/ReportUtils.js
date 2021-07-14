const stringMessage = require('../value/string')
const RollCallReport = require('../models/RollCallReport');
const moment = require('moment') 


function getDate(){
    const now = moment();
    return moment(now, 'DD-MM-YYYY');
}

function genRandomString(seed, length){
    let res = "";
    for(let i = 0; i < length; i++){
        res += res.charAt(Math.floor(Math.random() * seed.length));
    }
    return res;
}

function genReportId(class_id, scheduleId){
    return [class_id, scheduleId, genRandomString('0123456789', 6)].join('$');
}

function isAbleCreatedReport(dateList){
    if(dateList.length > 0){
        const shift = dateList[0].split('/')[0];
        const now = shift + '/' + moment();
        const nowMM = moment(now, 'DD-MM-YYYY');
        return dateList.indexOf(nowMM);
    }
    else{
        return -1;
    }
    
}

module.exports = {
    isAbleCreatedReport,
    genReportId,
    getDate,
}