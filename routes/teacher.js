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
 * @typedef ListUsers
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<User>} data.required - các phần tử
 */


/**
 * Get tất cả tài khoản teacher hiện có. Chỉ có tài khoản quyền Admin mới thực hiện được chức năng này.
 * @route GET /teachers/
 * @group Teacher
 * @returns {ListUsers.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
 router.get('/', auth.isAdmin, async(req, res) => {
    User.find({role:"teacher"}, function(err, users){
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

module.exports = router;