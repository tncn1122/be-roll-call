const stringMessage = require('../value/string')

function Id(text){
    if(!/^/.test(text)){
        throw new Error(stringMessage.id_form);
    }
}


module.exports = {
    Id
}