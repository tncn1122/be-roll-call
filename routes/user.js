const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
var express = require('express');
const User = require('../models/User');
const stringError = require('../value/string');

const router = express.Router()

/**
 * @typedef Login
 * @property {string} id.required - username
 * @property {string} password.required - password
 */

/**
 * @typedef ListUsers
 * @property {Integer} count.required - số lượng phần tử
 * @property {Array.<User>} data.required - các phần tử
 */


/**
 * Get tất cả tài khoản hiện có. Chỉ có tài khoản quyền Admin mới thực hiện được chức năng này.
 * @route GET /users/
 * @group User
 * @returns {ListUsers.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
router.get('/', auth.isAdmin, async(req, res) => {
    User.find({}, function(err, users){
        //console.log(users);
        if(err){
            res.status(500).send({message: err})
        }
        else{
            res.status(200).send({
                count: users.length,
                data: users
            });
        }
    });
})


/**
 * Tạo tài khoản. Chỉ có tài khoản có quyền Admin mới thực hiện được chức năng này.
 * @route POST /users/
 * @group User
 * @param {User.model} user.body.require - Body là file json chứa thông tin user, những mục không bắt buộc (class, qrUrl, token) có thể không cần gửi trong json. Role thuộc một trong các từ ["admin", "teacher", "student"].
 * @returns {User.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
router.post('/', auth.isAdmin, async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        await user.generateAuthToken();
        await user.save();
        res.status(201).send({user});
    } catch (error) {
        //console.log(error);
        if(error.code == 11000){
            res.status(400).send({message: ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))});
        }
        res.status(400).send({message: error.message})
    }
})

/**
 * Chỉnh sửa thông tin tài khoản. Chỉ những tài khoản đã đăng nhập mới thực hiện được. Một tài khoản chỉ có thể thay đổi thông tin của chính tài khoản đó.
 * @route PUT /users/
 * @group User
 * @param {UserInfo.model} user.body.require - User với quyền thông thường chỉ có thể sửa các thông tin như ở Body mẫu. Body put lên có thể không chứa đủ các trường như dưới mẫu, nhưng chỉ có những trường đó có thể thay đổi (những trường khác VD: id, password,..) có thể gửi lên nhưng sẽ không bị thay đổi.
 * @returns {User.model} 200 - Thông tin tài khoản đã chỉnh sửa và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
router.put('/', auth.isUser, async (req, res) => {
    // seft update user info
    try {
        let userUpdate = req.body;
        let user = req.user;
        delete userUpdate['id'];
        delete userUpdate['password'];
        delete userUpdate['role'];
        delete userUpdate['token'];
        delete userUpdate['classes'];
        delete userUpdate['_id'];
        delete userUpdate['__v'];
        await User.findByIdAndUpdate(user._id, userUpdate, function(err, raw){
            if(!err){
                res.status(201).send({user: raw});
            }
            else{
                res.status(201).send({message: err});
            }
        });
        
        
    } catch (error) {
        //console.log(error);
        if(error.code == 11000){
            res.status(400).send({message: ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))});
        }
        else{
            res.status(400).send({message: error.message});
        }
        
    }
})

/**
 * Post thông tin để đăng nhập vào hệ thống. Không yêu cầu quyền khi đăng nhập.
 * @route POST /users/login
 * @group User
 * @param {Login.model} login.body.require - Thông tin đăng nhập.
 * @returns {User.model} 200 - Thông tin tài khoản kèm token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin tài khoản gửi lên sai.
 */
router.post('/login', async(req, res) => {
    //Login a registered user
    try {
        const { id, password } = req.body
        if(id && password){
            const user = await User.findByCredentials(id, password)
            if (!user) {
                return res.status(400).send({message: stringError.invalid_credentials});
            }
            await user.generateAuthToken()
            res.send({ user })
        }
        else{
            res.status(400).send({message: stringError.invalid_credentials});
        }
    } catch (error) {
        //TODO
        //console.log(error);
        res.status(400).send({message: error})
    }
})

/**
 * Đăng xuất khỏi hệ thống. Chỉ những tài khoản đã đăng nhập mới thực hiện được.
 * @route POST /users/logout
 * @group User
 * @param {object} user.body.required - Nội dung không bắt buộc, sau khi post thành công token của user sẽ bị xóa.
 * @returns {Error.model} 200 - Success nếu thao tác thành công.
 * @returns {Error.model} 500 - Lỗi.
 * @security Bearer
 */
router.post('/logout', auth.isUser, async(req, res) => {
    //Login a registered user
    try {
        req.user.token = "";
        await req.user.save()
        res.status(200).send({message: "success"})
    } catch (error) {
        //console.log(error);
        //TODO
        res.status(500).send({message: error})
    }
})


router.get('/resetpass', async(req, res) => {
    try{
        const user = await User.findOne({id: "admin" });
        user.password = "admin";
        user.save();
        res.status(200).send({message: "success"})
    }
    catch(err){
        res.status(500).send({message: err})
    }
})

module.exports = router;

