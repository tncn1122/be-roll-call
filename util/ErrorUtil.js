const stringError = require('../value/string')

function makeErrorValidateMessage(errorKey){
    errorKey = errorKey.replace(/\"|{|}/g, "");
    return errorKey + " " + stringError.duplicate_credentials;
}

module.exports = {
    makeErrorValidateMessage,
}