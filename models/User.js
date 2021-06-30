const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const stringError = require('../value/string')

/**
 * @typedef User
 * @property {string} id.required
 * @property {string} name.required
 * @property {string} email.required
 * @property {string} password.required
 * @property {enum} role.required  - Một trong các role sau đây: - eg: student, teacher, admin
 * @property {string} qrUrl
 * @property {string[]} class
 * @property {string} token
 */

/**
 * @typedef UserInfo
 * @property {string} name
 * @property {string} email
 * @property {string} qrUrl
 */

const userSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: [true, stringError.id_required],
        trim: true
    },
    name: {
        type: String,
        required: [true, stringError.name_required],
        trim: true
    },
    email: {
        type: String,
        required: [true, stringError.email_required],
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error(stringError.invalid_email)
            }
        }
    },
    password: {
        type: String,
        required: [true, stringError.password_required],
        minLength: 5
    },
    role:{
        type: String,
        enum: {
            values: ['admin', 'student', 'teacher'],
            message: "Quyền không đúng!"
        },
        default: 'student',
        require: [true, stringError.role_wrong]
    },
    classes: [{
        class:{
            type: String,
            require: true
        }
    }],
    qrUrl: {
        type: String,
    },
    token: {
        type: String,
    }
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.token = token
    await user.save()
    return token
}

//=====
userSchema.statics.findByCredentials = async (id, password) => {
    // Search for a user by id and password.
    const user = await User.findOne({id: id} )
    if (!user) {
        return null;
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        return null;
    }
    
    return user
}

userSchema.methods.isUnique = async (id, email) =>{
    const userId = await User.findOne({id: id})
    if (userId){
        return false;
    }
    return true;

}
//===
const User = mongoose.model('User', userSchema)

module.exports = User