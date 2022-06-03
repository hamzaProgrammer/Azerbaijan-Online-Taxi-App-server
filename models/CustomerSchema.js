const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
    phoneNo: {
        type: Number,
        required: true,
    },
    verifyStatus: {
        type: Boolean,
        default : false
    },
    firstname: {
        type: String,
        default : ''
    },
    dateOfBirth : {
        type : String,
        default : ''
    },
    address: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    whatsAppNo: {
        type: Number,
        default: null
    },
    orders: [{
        type: mongoose.Types.ObjectId,
        ref: 'oturqapporders',
    }],
    myLocations: {
        type: [String],
    },
    profilePic: {
        type: String,
        default: ''
    },
    curntLoc: { // location of user
        type: Array
    },
    currentAddress: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});


const OturqAppCustomers = mongoose.model('OturqAppCustomers', CustomerSchema);

module.exports = OturqAppCustomers