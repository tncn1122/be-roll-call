function genClassInfo(class_id, class_date, class_secret){
    return ["class", class_id, class_date, class_secret].join("_");
}

function genStudentInfo(student_id){
    return ["student", student_id].join("_");
}


function createQR(info){
    const url = "https://api.qrserver.com/v1/create-qr-code/?data=";
    return url+info
}



module.exports = {
    genClassInfo,
    genStudentInfo,
    createQR,
}