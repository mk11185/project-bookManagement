const {validator, jwt} = require('../utils')
const {systemConfig} = require('../configs')
const {userModel} = require('../models')

const registerUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide user details'})
            return
        }

        // Extract params
        const {name, phone, title, email, password, address} = requestBody; // Object destructing

        // Validation starts
        if(!validator.isValid(name)) {
            res.status(400).send({status: false, message: 'name is required'})
            return
        }

        if(!validator.isValid(phone)) {
            res.status(400).send({status: false, message: 'phone is required'})
            return
        }

        if(!validator.isValidNumber(phone)) {
            res.status(400).send({status: false, message: 'phone attribute should be a number'})
            return
        }

        const isPhoneAlreadyUsed = await userModel.findOne({phone});

        if(isPhoneAlreadyUsed) {
            res.status(400).send({status: false, message: `${phone} is already registered`})
            return
        }

        if(!validator.isValid(title)) {
            res.status(400).send({status: false, message: 'Title is required'})
            return
        }
        
        if(!validator.isValidTitle(title)) {
            res.status(400).send({status: false, message: `Title should be among ${systemConfig.titleEnumArray.join(', ')}`})
            return
        }

        if(!validator.isValid(email)) {
            res.status(400).send({status: false, message: `Email is required`})
            return
        }
        
        if(!validator.validateEmail(email)) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }    
        
        const isEmailAlreadyUsed = await userModel.findOne({email}); // {email: email} object shorthand property

        if(isEmailAlreadyUsed) {
            res.status(400).send({status: false, message: `${email} email address is already registered`})
            return
        }

        if(!validator.isValid(password)) {
            res.status(400).send({status: false, message: `Password is required`})
            return
        }

        if(!validator.PasswordLength(password)){
            res.status(400).send({status: false, message: `Password length should be 8 - 15 characters`})
            return
        }
        // Validation ends

        const userData = {name, phone, title, email, password, address}
        const newUser = await userModel.create(userData);

        res.status(201).send({status: true, message: `Success`, data: newUser});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide login details'})
            return
        }

        // Extract params
        const {email, password} = requestBody;
        
        // Validation starts
        if(!validator.isValid(email)) {
            res.status(400).send({status: false, message: `Email is required`})
            return
        }
        
        if(!validator.validateEmail(email)) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }

        if(!validator.isValid(password)) {
            res.status(400).send({status: false, message: `Password is required`})
            return
        }
        // Validation ends

        const user = await userModel.findOne({email, password});

        if(!user) {
            res.status(401).send({status: false, message: `Invalid login credentials`});
            return
        }

        const token = await jwt.createToken({userId: user._id});

        res.header('x-api-key', token);
        res.status(200).send({status: true, message: `success`, data: {token}});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {
    registerUser,
    loginUser
}
