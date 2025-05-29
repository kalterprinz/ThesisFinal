const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DriverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female','other']
    },
    birthday: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    conNum: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    occu: {
        type: String,
        required: true,
    },
    DriLicense: {
        type: String,
        required: true,
        unique: true
    },
    DLClass:{
        type: String,
        required: true,
        unique: true
    },
    DLIssue:{
        type: String,
        required: true,
        unique: true
    },
    DLExpireDate:{
        type: String,
        required: true,
        unique: true
    },
    front: {
        data: { type: Buffer, required: true }, 
        contentType: { type: String, required: true },
    },
    back: {
        data: { type: Buffer, required: true }, 
        contentType: { type: String, required: true },
    },
    profilePic: {
        data: { type: Buffer, required: true }, 
        contentType: { type: String, required: true },
    },
    password: {
        type: String,
        required: true
    }
});

const DriverModel = mongoose.model('Driver', DriverSchema);

module.exports = DriverModel;
