const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const stringMessage = require('../value/string');
const QR = require('../util/QR');
const ClassInfo = require('../models/ClassInfo');
const router = express.Router()

/**
 * @typedef DashboardInfo
 * @property {string} student_count.required - số lượng sinh viên
 * @property {string} teacher_count.required - số lượng sinh viên
 * @property {string} class_count.required - số lượng sinh viên
 */


/**
 * @typedef Dashboard
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<DashboardInfo>} data.required - các phần tử
 */


/**
 * Get thông tin số lượng tài khoản và lớp hiện có. Chỉ có tài khoản quyền Admin mới thực hiện được chức năng này.
 * @route GET /dashboard/
 * @group Dashboard
 * @returns {Dashboard.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/', auth.isAdmin, async(req, res) => {

    const studentList = await User.find({role:"student"})
    const teacherList = await User.find({role:"teacher"})
    const classList = await ClassInfo.find({})



    // Class.find({role:"student"}, function(err, users){
    //     //console.log(users);
    //     if(!err){
    //         student_count = users.length();
    //     }
    // });
   
    res.status(200).send(ResponseUtil.makeResponse({
        student_count: studentList.length + " học sinh", 
        teacher_count: teacherList.length + " giảng viên", 
        class_count: classList.length + " lớp học"
    }));
})

module.exports = router;