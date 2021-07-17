const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs')
const ClassInfo = require('../models/ClassInfo');
const User = require('../models/User');
const stringMessage = require('../value/string');
const QR = require('../util/QR')
const router = express.Router()
const classUtil = require('../util/ClassUtils')
const userUtil = require('../util/UserUtils')
const moment = require('moment-timezone') 

/**
 * @typedef ListClasses
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<Class>} data.required - các phần tử
 */

/**
 * Tạo lớp. Chỉ có tài khoản có quyền Admin mới thực hiện được chức năng này.
 * @route POST /classes/
 * @group Class
 * @param {ClassInput.model} class_info.body.required - Body là file json chứa thông tin lớp, những mục (students, monitors) có thể không cần gửi trong json.
 * @returns {ListClasses.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/', auth.isAdmin, async (req, res) => {
    // Create a new class
    try {
        let classInfo = classUtil.createBaseClassInfo(req.body);
        
        const teacher = await User.findOne({id: req.body.teacher.id});
        if(!teacher){
            return res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.user_not_found + "Giảng viên: " + req.body.teacher.id));
        }
        classInfo.teacher = teacher;
        classInfo.students = [];
        if (req.body.hasOwnProperty('students')){
            classInfo.students = await createStudentList(req.body.students);
        }
        classInfo.monitors = [];
        if (req.body.hasOwnProperty('monitors')){
            classInfo.monitors = await createStudentList(req.body.monitors);
        }
        if (req.body.hasOwnProperty('dateStart')){
            if(!classUtil.validateDate(classInfo.dateStart)){
                throw new Error(stringMessage.date_wrong);
            }
        }
        else{
            classInfo.dateStart = classUtil.formatDate(moment());
        }
        
        console.log(classInfo);
        const newClass = new ClassInfo(classInfo);
        await newClass.save();

        // update student
        if (req.body.hasOwnProperty('students')){
            await updateStudentClass(req.body.students.map(student_id => [student_id.id, 1]), classInfo.id);
        }

        // update teacher
        await updateTeacherClass(teacher.id, 1, classInfo.id);
        
        res.status(201).send(ResponseUtil.makeResponse(classInfo));
        // res.status(200).send(ResponseUtil.makeMessageResponse("Ok thơm bơ"))
    } catch (error) {
        console.log(error);
        if(error.code == 11000){
            return res.status(400).send(ResponseUtil.makeMessageResponse(ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))));
        }
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})

/**
 * Get tất cả lớp hiện có. Chỉ có tài khoản quyền Admin mới thực hiện được chức năng này.
 * @route GET /classes/
 * @group Class
 * @returns {ListClasses.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/', auth.isAdmin, async(req, res) => {
    ClassInfo.find({}, function(err, classes){
        //console.log(users);
        if(err){
            res.status(500).send(ResponseUtil.makeMessageResponse(error.message))
        }
        else{
            console.log((classes));
            res.status(200).send(ResponseUtil.makeResponse(classes))
        }
    }).populate('students').populate('monitors').populate('teacher');
})

/**
 * Xóa một lớp khỏi hệ thống dựa vào ID, chỉ có Admin mới thực hiện được chức năng này.
 * @route DELETE /classes/{id}
 * @group Class
 * @param {string} id.path.required ID của lớp cần xóa.
 * @returns {Error.model} 200 - "Xóa thành công!" nếu thao tác thành công.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.delete('/:id', auth.isAdmin, async(req, res) => {
    try{
        let classId = req.params.id;
        const classInfo = await ClassInfo.findOne({id: classId});
        if (classInfo){
            await classInfo.remove();
            // await ClassInfo.remove({id: classId})
            res.status(200).send(ResponseUtil.makeMessageResponse(stringMessage.deleted_successfully));
        }
        else{
            res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.class_not_found));
        }
        
    }
    catch(err){
        res.status(500).send(ResponseUtil.makeMessageResponse(err.message));
    }
})

/**
 * Sửa một lớp dựa vào ID, chỉ có Admin mới thực hiện được chức năng này.
 * @route PUT /classes/
 * @group Class
 * @param {Class.model} class.body.required Body của lớp cần sửa.
 * @returns {Class.model} 200 - Thông tin lớp nếu thao tác thành công.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.put('/', auth.isAdmin, async(req, res) => {
    try{
        let classUpdate = req.body;
        const classInfo = await findClass(classUpdate.id);
        if(classUtil.isChangeExpired(classInfo.dateStart)){
            return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.class_change_timeup));
        }
        let class_id = classInfo.id;
        delete classUpdate['id'];
        if (classInfo.teacher.id !== classUpdate.teacher.id){
            // remove class from old teacher
            await updateTeacherClass(classInfo.teacher.id, 0, classInfo.id);
            // add class to new teacher
            await updateTeacherClass(classUpdate.teacher.id, 1, classInfo.id);
        }

        classUpdate.teacher = await findUser(classUpdate.teacher.id);
        classUpdate.students = await createStudentList(classUpdate.students);
        await ClassInfo.findOneAndUpdate({id: class_id}, classUpdate, {runValidators: true}, async function(error, raw){
            if(!error){
                if(raw){
                    raw.save();
                    await updateStudentAfterChange(classInfo.students, classUpdate.students, class_id);
                    return res.status(201).send(ResponseUtil.makeResponse(raw));
                }
                else{
                    return res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.class_not_found));
                }
            }
            else{
                return res.status(400).send(ResponseUtil.makeMessageResponse(error.message));
            }
        }).populate('students').populate('monitors').populate('teacher');;
    }
    catch(err){
        console.log(err);
        return res.status(500).send(ResponseUtil.makeMessageResponse(err.message));
    }
})

/**
 * Lấy thông tin của một lớp, user đã đăng nhập mới thực hiện được chức năng này.
 * @route GET /classes/{id}
 * @group Class
 * @param {string} id.path.required ID của lớp cần lấy thông tin.
 * @returns {Class.model} 200 - Thông tin lớp nếu thao tác thành công.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/:id', auth.isUser, async(req, res) => {
    try{
        let classId = req.params.id;
        const classInfo = await findClass(classId);
        if (classInfo){
            res.status(200).send(ResponseUtil.makeResponse(classInfo));
        }
        else{
            res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.class_not_found));
        }
        
    }
    catch(err){
        console.log(err)
        res.status(500).send(ResponseUtil.makeMessageResponse(error.message));
    }
})

async function findStudent(userId){
    return await User.findOne({id: userId});
}

async function createStudentList(student_id_list){
    let student_list = [];

    if (student_id_list && student_id_list.length > 0){
        for (const student_id of student_id_list){
            let student = findStudent(student_id.id);
            if(student){
                student_list.push(student);
            }
            else{
                throw new Error(stringMessage.user_not_found + " Sinh viên: " + student_id.id);
            }  
        }
    }
    return Promise.all(student_list);
}

async function findClass(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('students').populate('monitors').populate('teacher');
    return classInfo;
}

async function updateStudentAfterChange(old_student_list, new_student_list, class_id){
    const simple_old_students_id = old_student_list.map(item => item.id);
    const simple_new_students_id = new_student_list.map(item => item.id);
    const update_state = new Map();
    for (const id of simple_old_students_id){
        update_state.set(id, 0);
    }

    for (const id of simple_new_students_id){
        if (update_state.has(id)){
            update_state.delete(id);
        }
        else{
            update_state.set(id, 1);
        }
    }

    await updateStudentClass(update_state, class_id);
}

async function updateStudentClass(student_state_list, class_id){
    let student_list = [];
    //console.log((student_state_list));
    if (student_state_list){
        for (const [key, value] of student_state_list){
            let current_user = await findUser(key);
            if (value == 1){
                // add class
                current_user.classes.push(class_id);
            }
            else{
                // remove class
                current_user.classes = current_user.classes.filter(item => item !== class_id);
            }
            await User.findOneAndUpdate({id: key}, current_user, function(error, raw){
                if(!error){
                    if(raw){
                        raw.save();
                    }
                    else{
                        throw new Error(stringMessage.user_not_found);
                    }
                }
                else{
                    throw new Error(ResponseUtil.makeMessageResponse(error.message))
                }
            });
        }
    }
    return Promise.all(student_list);
}

async function updateTeacherClass(teacher_id, state, class_id){
    console.log(teacher_id);
    let current_user = await findUser(teacher_id);
    if (state == 1){
        // add class
        current_user.classes.push(class_id);
    }
    else{
        // remove class
        current_user.classes = current_user.classes.filter(item => item !== class_id);
    }
    await User.findOneAndUpdate({id: teacher_id}, current_user, function(error, raw){
        if(!error){
            if(raw){
                raw.save();
            }
            else{
                throw new Error(stringMessage.user_not_found);
            }
        }
        else{
            throw new Error(ResponseUtil.makeMessageResponse(error.message))
        }
    });
}

async function findUser(userId){
    let user =  await User.findOne({id: userId});
    if(user){
        return user;
    }
    else{
        throw new Error(stringMessage.user_not_found);
    }

}


router.get('/delete/all', async(req, res) => {
    try{
      
        await ClassInfo.deleteMany({})
        res.status(200).send(ResponseUtil.makeMessageResponse("Delete success"))
    }
    catch(err){
        res.status(500).send(ResponseUtil.makeMessageResponse(err.message))
    }
})


module.exports = router;