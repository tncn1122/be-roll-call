const jwt = require('jsonwebtoken')
const User = require('../models/User')
const stringMessage = require('../value/string')

const isUser = async(req, res, next) => {    
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
        if (!user) {
            throw new Error({message: stringMessage.not_auth})
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //console.log(stringMessage.not_auth);
        res.status(401).send({message: stringMessage.not_auth})
    }

}

const isAdmin = async(req, res, next) => {    
    try {
        //console.log(req);
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
        if (!user || (user && user.role !== "admin")) {
            throw new Error({message: stringMessage.not_auth})
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //console.log(error);
        res.status(401).send({message: stringMessage.not_auth})
    }

}

const isReporter = async(req, res, next) => {    
    try {
        //console.log(req);
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
        if (!user || (user && (user.role !== "admin" && user.role !== "teacher"))) {
            throw new Error({message: stringMessage.not_auth})
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //console.log(error);
        res.status(401).send({message: stringMessage.not_auth})
    }

}

const isTeacher = async(req, res, next) => {    
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
        if (!user || (user && user.role !== "teacher")) {
            throw new Error({message: stringMessage.not_auth})
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //console.log(stringMessage.not_auth);
        res.status(401).send({message: stringMessage.not_auth})
    }

}

const isStudent = async(req, res, next) => {    
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
        if (!user || (user && user.role !== "student")) {
            throw new Error({message: stringMessage.not_auth})
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //console.log(stringMessage.not_auth);
        res.status(401).send({message: stringMessage.not_auth})
    }

}
module.exports = {
    isUser,
    isAdmin,
    isTeacher,
    isStudent,
    isReporter
}
