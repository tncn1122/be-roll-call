const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const stringError = require('../value/string')

/*
id
name
email
pass
role
token
*/
const userSchema = mongoose.Schema({
    id: {
        type: String,
        unique: true,
        require: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
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
        required: true,
        minLength: 5
    },
    role:{
        type: String,
        require: true
    },
    classes: [{
        class:{
            type: String,
            require: true
        }
    }],
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
        //throw new Error({ error: 'Invalid login credentials' })
        return null
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        //throw new Error('Invalid login credentials')
        return null
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