const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    ticketNumber: { 
        type: String, 
        required: true, 
    },
    nameOfDriver:{
        type: String,
    },
    placeOfViolation:{
        type: String,
        required:true,
    },
    timeOfApprehension:{
        type: Date,
        required:true,
    },
    dateOfApprehension:{
        type: Date,
        required:true,
    },
    vehicleClassification:{
        type: String,
    },
    violationType:{
        type: String,
    },
    violationDes:{
        type: String,
    },
    violationModel:{
        type: String,
    },
    gender:{
        type: String,
    },
     age:{
        type: Number,
    },
     fineStatus:{
        type: String,
    },
     apprehendingOfficer:{
        type: String,
        required:true,
    },
    address:{
        type: String,
    }, 
    phoneNumber:{
        type: String,
    }, 
    email:{
        type: String,
    }, 
    occupation:{
        type: String,
    }, 
    licenseNumber:{
        type: String,
    }, 
    expirationDate:{
        type: String,
    }, 
    licenseClassification:{
        type: String,
    }, 
    plateNumber:{
        type: String,
    }, 
    vehicleModel:{
        type: String,
    },
    vehicleYear:{
        type: String,
    },
    vehicleColor:{
        type: String,
    },
    vehicleOwnerName:{
        type: String,
    },
    vehicleOwnerAddress:{
        type: String,
    },
    fineAmount:{
        type: String,
    },
    dateOfBirth:{
        type: Date,
    },
    dueDate:{
        type: Date,
    },
    oRNo:{
        type:String,
    },
    datepaid:{
        type:Date,
    },
    agency:{
        type:String,
    },
    officerremoved:{
        type:String,
    },
    signature:{
        data: { type: Buffer}, 
        contentType: { type: String },
    },
    evidence:{
        data: { type: Buffer}, 
        contentType: { type: String },
    },
});

const RecordModel = mongoose.model('Record', RecordSchema);

module.exports = RecordModel;