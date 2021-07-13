const stringMessage = require('../value/string')
const User = require('../models/User');

function hideUserInfo(userInfo){
    return {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        qrUrl: userInfo.qrUrl,
        avtUrl: userInfo.avtUrl
    };
}

function onlyAdminAndOwner(current_user, des_id){
    if(current_user.id !== des_id && current_user.role !== "admin"){
        throw new Error(stringMessage.not_auth);
    }
}

function passwordValidate(password){
    if(password.length < 5){
        throw new Error(stringMessage.invalid_password_format);
    }
}

function generateAvatar(name){
    let avtUrl = 'https://ui-avatars.com/api/?background=random&name=';
    const nameArr = name.split(" ");
    if(nameArr.length >= 2){
        return avtUrl+nameArr.slice(-2).join("+")
    }
    else{
        return avtUrl+name
    }
}

async function findUser(user_id){
    const user = await User.findOne({id: user_id });
    return user;
}

async function createStudentList(student_id_list){
    let student_list = [];

    if (student_id_list){
        for (const student_id of student_id_list){
            const student = User.findOne({id: student_id.id});
            if(!student){
                throw new Error(stringMessage.user_not_found + " Sinh viên: " + student_id.id);
            }
            student_list.push(student);
        }
    }
    return student_list;
}


module.exports = {
    hideUserInfo,
    passwordValidate,
    generateAvatar,
    onlyAdminAndOwner,
    findUser,
    createStudentList
}