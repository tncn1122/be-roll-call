const stringError = require('../value/string')

function hideUserInfo(userInfo){
    return {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        qrUrl: userInfo.qrUrl
    };
}

function passwordValidate(password){
    if(password.length < 5){
        throw new Error(stringError.invalid_password_format);
    }
}


module.exports = {
    hideUserInfo,
    passwordValidate
}