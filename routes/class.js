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


/**
 * @typedef ListClasses
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<Class>} data.required - các phần tử
 */

/**
 * Tạo lớp. Chỉ có tài khoản có quyền Admin mới thực hiện được chức năng này.
 * @route POST /classes/
 * @group Class
 * @param {Class.model} class_info.body.required - Body là file json chứa thông tin lớp, những mục (students, monitors) có thể không cần gửi trong json.
 * @returns {ListClasses.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/', auth.isAdmin, async (req, res) => {
    // Create a new user
    try {
        let classInfo = classUtil.createBaseClassInfo(req.body);
        const teacher = userUtil.findUser(req.body.teacher.id);
        if(!teacher){
            return res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.user_not_found + "Giảng viên: " + req.body.teacher.id));
        }
        classInfo.teacher = teacher;
        classInfo.students = userUtil.createStudentList(req.body.students);
        classInfo.monitors = [];
        if (req.body.hasOwnProperty('monitors')){
            classInfo.monitors = await userUtil.createStudentList(req.body.monitors);
        }
        
        const newClass = new ClassInfo(req.body);
        await newClass.save();
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
    });
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
        if (userUtil.findUser(classId)){
            await User.deleteOne({id: classId})
            res.status(200).send(ResponseUtil.makeMessageResponse(stringMessage.deleted_successfully))
        }
        else{
            res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.user_not_found))
        }
        
    }
    catch(err){
        log(err)
        res.status(500).send(ResponseUtil.makeMessageResponse(error.message))
    }
})

/**
 * Lấy thông tin của một lớp, user đã đăng nhập mới thực hiện được chức năng này.
 * @route GET /classes/{id}
 * @group Class
 * @param {string} id.path.required ID của lớp cần lấy thông tin.
 * @returns {Error.model} 200 - "Xóa thành công!" nếu thao tác thành công.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/:id', auth.isUser, async(req, res) => {
    try{
        let classId = req.params.id;
        const classInfo = await classUtil.findClass(classId);
        console.log(classInfo);
        if (classInfo){
            res.status(200).send(ResponseUtil.makeResponse(classInfo));
        }
        else{
            res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.class_not_found));
        }
        
    }
    catch(err){
        log(err)
        res.status(500).send(ResponseUtil.makeMessageResponse(error.message));
    }
})

module.exports = router;