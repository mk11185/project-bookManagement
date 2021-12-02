const mongoose = require('mongoose')

const { validator } = require('../utils')
const { systemConfig } = require('../configs')

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'title is required',
        enum: systemConfig.titleEnumArray
    },
    name: {
        type: String,
        required: 'Bookname title is required'
    },
    phone: {
        type: String,
        required: 'Phone No is required',
        unique: true
    },
    email: {
        type: String,
        required: 'EmailId is required',
        unique: true,
        validate: { validator: validator.validateEmail, message: 'Please fill a valid email address', isAsync: false },
        match: [validator.emailRegex, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: 'password is required',
        validate: { validator: validator.PasswordLength, message: 'The password should be more than 8 letters and less tham 15 letters', isAsync: false }
    },
    address: {
        street: { type: String },
        city: { type: String },
        pincode: { type: String }
    },
}, { timestamps: true })
module.exports = mongoose.model('User', userSchema, 'user')