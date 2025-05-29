const mongoose = require('mongoose');

const ClearanceSchema = new mongoose.Schema({
    ticketNumber: { 
        type: String, 
        required: true, 
    },
    name:{
        type: String,
    },
    address:{
        type: String,
    },
    vehicle: 
    {
        type: String
    },
    brand: {
        type: String,
    },
    plateNumber: {
        type: String,
    },
    chassisNumber: {
        type: String,
    },
    requirement: {
        type: String,
    },
    requirementAddress: {
        type: String,
    },
    encoder: {
        type: String,
    },
    adminInCharge: {
        type: String,
    },
    oRNo:{
        type:String,
    },
    fineAmount:{
        type:String,
    },
    datepaid:{
        type:String,
    },
    submissionDate: 
    { 
        type: Date, default: Date.now 

    }
    });
    
    const ClearanceModel = mongoose.model('Clearance', ClearanceSchema);
    
    module.exports = ClearanceModel;