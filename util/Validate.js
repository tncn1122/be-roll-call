const stringMessage = require('../value/string')

function id(text){
    if(!/^/.test(text)){
        throw new Error(stringMessage.id_form);
    }
}


module.exports = {
    Id
}