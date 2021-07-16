function makeResponse(data = []){
    let arrayData = []
    let count = 0
    if(Array.isArray(data)){
        count = data.length
        arrayData = data
    }
    else{
        arrayData.push(data)
        count = 1;
    }
    
    return {
        count: count,
        data: arrayData
    }
}

function makeMessageResponse(message = "Success"){
    return {
        message: message
    }
}

module.exports = {
    makeResponse,
    makeMessageResponse
}