const stringMessage = require('../value/string')
const moment = require('moment-timezone');

function id(text){
    if(!/^/.test(text)){
        throw new Error(stringMessage.id_form);
    }
}

function limitTime(expired, limit){
    const limitTime = moment(limit, "HH:mm");
    const expiredTime = moment(expired, "HH:mm");
    if(expiredTime.isAfter(limitTime)){
        return expired;
    }
    else{
        return limitTime;
    }
}

module.exports = {
    id,
    limitTime
}