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
 * @typedef ListClasses
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<Class>} data.required - các phần tử
 */

/**
 * Tạo lớp. Chỉ có tài khoản có quyền Admin mới thực hiện được chức năng này.
 * @route POST /class/
 * @group Class
 * @param {Class.model} class.body.required - Body là file json chứa thông tin lớp, những mục (students, monitors) có thể không cần gửi trong json.
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


module.exports = router;