const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const stringError = require('../value/string');
const QR = require('../util/QR')
const router = express.Router()

/**
 * @typedef DashboardInfo
 * @property {integer} student_count.required - số lượng sinh viên
 * @property {integer} teacher_count.required - số lượng sinh viên
 * @property {integer} class_count.required - số lượng sinh viên
 */


/**
 * @typedef ListUsers
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<DashboardInfo>} data.required - các phần tử
 */


/**
 * Get thông tin số lượng tài khoản hiện có. Chỉ có tài khoản quyền Admin mới thực hiện được chức năng này.
 * @route GET /dashboard/
 * @group Dashboard
 * @returns {ListUsers.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/', auth.isAdmin, async(req, res) => {
    var student_count = 0;
    var teacher_count = 0;
    var class_count = 0;

    await User.find({role:"student"}, function(err, users){
        //console.log(users);
        if(!err){
            student_count = users.length;
        }
    });

    await User.find({role:"teacher"}, function(err, users){
        if(!err){
            teacher_count = users.length;
        }
    });

    // Class.find({role:"student"}, function(err, users){
    //     //console.log(users);
    //     if(!err){
    //         student_count = users.length();
    //     }
    // });
    res.status(200).send(ResponseUtil.makeResponse({
        student_count: student_count, 
        teacher_count: teacher_count, 
        class_count: class_count
    }));
})

module.exports = router;