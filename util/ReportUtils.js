const stringMessage = require('../value/string')
const RollCallReport = require('../models/RollCallReport');
const ClassInfo = require('../models/ClassInfo');
const moment = require('moment');



function getDate(){
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
        const shift = dateList[0].split('/')[0];
        const now = moment();
        const nowMM = shift + '/' + formatDate(moment(now, 'DD-MM-YYYY'));
        console.log(nowMM);
        console.log(dateList);
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