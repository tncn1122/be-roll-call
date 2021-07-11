const stringMessage = require('../value/string')

function makeErrorValidateMessage(errorKey){
    errorKey = errorKey.replace(/\"|{|}/g, "");
    return errorKey + " " + stringMessage.duplicate_credentials;
}

module.exports = {
    makeErrorValidateMessage,
}