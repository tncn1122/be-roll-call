const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const stringMessage = require('../value/string');
const QR = require('../util/QR')
const router = express.Router()


/**
 * @typedef ListUsers
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<User>} data.required - các phần tử
 */


/**
 * Get tất cả tài khoản sinh viên hiện có. Chỉ có tài khoản quyền Admin mới thực hiện được chức năng này.
 * @route GET /students/
 * @group Student
 * @returns {ListUsers.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/', auth.isAdmin, async(req, res) => {
    User.find({role:"student"}, function(err, users){
        //console.log(users);
        if(err){
            res.status(500).send(ResponseUtil.makeMessageResponse(err))
        }
        else{
            console.log((users));
            res.status(200).send(ResponseUtil.makeResponse(users))
        }
    });
})



/**
 * Xem thông tin tài khoản sinh viên. Chỉ những tài khoản đã đăng nhập mới thực hiện được chức năng này. Riêng tài khoản quyền admin hoặc tài khoản tự xem của bản thân sẽ xem được toàn bộ thông tin tài khoản.
 * @route GET /students/{id}
 * @group Student
 * @param {string} id.path.required ID của tài khoản sinh viên.
 * @returns {ListUsers.model} 200 - Thông tin tài khoản ứng với tài khoản đó.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.get('/:id', auth.isUser, async (req, res) => {
    try {
        let userResponse = await User.findOne({id: req.params.id, role: 'student'})
        if(!userResponse){
            res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.user_not_found))
        }
        else{
            if((req.user.role !== "admin") && req.user.id !== req.params.id){
                userResponse = userUtil.hideUserInfo(userResponse);
            }
            res.status(200).send(ResponseUtil.makeResponse(userResponse));
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})


module.exports = router;