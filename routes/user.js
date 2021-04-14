var express = require('express');
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/register', auth ,async (req, res) => {
    // Create a new user
    try {
        
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/login', async(req, res) => {
    //Login a registered user
    try {
        const { id, password } = req.body
        const user = await User.findByCredentials(id, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;
