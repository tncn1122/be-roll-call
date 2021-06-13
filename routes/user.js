const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
var express = require('express');
const User = require('../models/User');
const stringError = require('../value/string');

const router = express.Router()

/**
 * @typedef Login
 * @property {string} id.required
 * @property {string} password.required
 */

/**
 * Gets the authenticated user's profile
 * @route POST /user/
 * @group User
 * @param {object} login.body.require - Thông tin đăng nhập:
 * @returns {object} 200 - An array of user info
 * @example dddd
 */
router.post('/', auth.isAdmin, async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        await user.generateAuthToken();
        await user.save();
        res.status(201).send({user});
    } catch (error) {
        console.log(error);
        if(error.code == 11000){
            res.status(400).send({message: ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))});
        }
        res.status(400).send({message: error.message})
    }
})

/**
 * @route PUT /user/
 * @group User
 * @param {object} email.body.required - username or email - eg: user@domain
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
        console.log(error);
        if(error.code == 11000){
            res.status(400).send({message: ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))});
        }
        else{
            res.status(400).send({message: error.message});
        }
        
    }
})

/**
 * Gets the authenticated user's profile
 * @route POST /user/login
 * @group User
 * @param {object} login.body.require - Thông tin đăng nhập:
 * @returns {object} 200 - An array of user info
 * @returns {object} 400 - An array of user info
 * @example dddd
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
        console.log(error);
        res.status(400).send({message: error})
    }
})

/**
 * @route POST /user/logout
 * @group User
 * @param {object} email.body.required - username or email - eg: user@domain
 */
router.post('/logout', auth.isUser, async(req, res) => {
    //Login a registered user
    try {
        req.user.token = "";
        await req.user.save()
        res.send()
    } catch (error) {
        console.log(error);
        //TODO
        res.status(500).send({message: error})
    }
})

module.exports = router;

