const req = require('express/lib/request');
const mongoose = require('mongoose')

const {systemConfig} = require('../configs')

const reemail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const validateEmail = function(email) {
    return reemail.test(email)
};

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const PasswordLength = function(password) {
    if(password.length >= 8 && password.length <= 15) return true
    return false;
}

const ratingRange = function(rating) {
    if(rating >= 1 && rating <= 5) return true
    return false;
}

const isValidTitle = function(title) {
    return systemConfig.titleEnumArray.indexOf(title) !== -1
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidFiles = function(requestFiles) {
    return requestFiles.length > 0 
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidString = function(value) {
    return Object.prototype.toString.call(value) === "[object String]"
}

const isValidNumber = function(value) {
    return Object.prototype.toString.call(value) === "[object Number]"
}

const isArray = function(arr) {
    return Array.isArray(arr)
}

const isValidDate = function(value) {
    return Object.prototype.toString.call(value) === "[object Date]"
}

module.exports = {
    validateEmail,
    emailRegex: reemail,
    isValid,
    isValidTitle,
    isValidRequestBody,
    isValidObjectId,
    isValidString,
    isArray,
    PasswordLength,
    isValidDate,
    isValidNumber,
    ratingRange,
    isValidFiles
};