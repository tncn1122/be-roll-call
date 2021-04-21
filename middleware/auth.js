const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async(req, res, next) => {    
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
        if (!user) {
            throw new Error({error: 'Not authorized to access this resource'})
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        //console.log(error);
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = auth