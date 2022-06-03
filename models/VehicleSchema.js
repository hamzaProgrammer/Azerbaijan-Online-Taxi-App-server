const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        default: ''
    },
    plateNo: {
        type: String,
        default: ''
    },
    plateCode: {
        type: String,
        default: ''
    },
    yearOfManuf: {
        type: String,
        default: ''
    },
    companyOfManuf: {
        type: String,
        default: ''
    },
    vehicleColor: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'oturqappdrivers',
    },
}, {
    timestamps: true
});


const OturqAppVehicles = mongoose.model('OturqAppVehicles', VehicleSchema);

module.exports = OturqAppVehicles