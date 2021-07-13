const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs')
const ClassInfo = require('../models/ClassInfo');
const stringMessage = require('../value/string');
const QR = require('../util/QR')
const router = express.Router()
const userUtil = require('../util/UserUtils')


/**
 * @typedef ListReports
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<RollCallReport>} data.required - các phần tử
 */

/**
 * Tạo danh sách điểm danh. Chỉ có tài khoản có quyền Admin hoặc teacher mới thực hiện được chức năng này.
 * @route POST /reports/
 * @group Report
 * @param {string} class_id.body.required - .
 * @returns {ListClasses.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/', auth.isAdmin, async (req, res) => {
    // Create a new user
    try {
        const classInfo = new ClassInfo(req.body);
        await classInfo.save();
        res.status(201).send(ResponseUtil.makeResponse(classInfo));
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
        const classInfo = ClassInfo.findOne({id: classId});
        if (classInfo){
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

module.exports = router;