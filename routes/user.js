var express = require('express');
const User = require('../models/User')
const auth = require('../middleware/auth')
const stringError = require('../value/string')

const router = express.Router()

router.post('/register', auth, async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.generateAuthToken()
        await user.save()
        res.status(201).send({user})
    } catch (error) {
        console.log(error);
        res.status(400).send({message: error.message})
    }
})

router.post('/login', async(req, res) => {
    //Login a registered user
    try {
        const { id, password } = req.body
        const user = await User.findByCredentials(id, password)
        if (!user) {
            return res.status(401).send({message: stringError.invalid_credentials})
        }
        await user.generateAuthToken()
        //user.token = token;
        res.send({ user })
    } catch (error) {
        //TODO
        res.status(400).send({message: error})
    }
})

router.post('/logout', auth, async(req, res) => {
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

