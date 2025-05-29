const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');

const OfficerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    idnum: {
        type: Number,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female','Other']
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
    agency: {
        type: String,
        required: true,
        enum: ['LTO', 'PNP','ICTPMO','CityTreasurer']
    },
    assign: {
        type: String,
        default:null,
        required: true,
    },
    dutyStatus: {
        type: String,
        required: true,
    },
    role:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
});

const OfficerModel = mongoose.model('Officer', OfficerSchema);

module.exports = OfficerModel;