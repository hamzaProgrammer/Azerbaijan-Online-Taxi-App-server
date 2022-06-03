const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
    phoneNo: {
        type: Number,
        required: true,
    },
    verifyStatus: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        default: ''
    },
    firstName: {
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
    lastName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    whatsAppNo: {
        type: Number,
        default: null
    },
    gender: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    vehicleDetails : [
        {
            type: mongoose.Types.ObjectId,
            ref: 'oturqappvehicles',
        }
    ],
    paymentDetails: {
        _id : false,
        bankName: {
            type: String,
            default : ''
        },
        accountNo: {
            type: String,
            default : ''
        },
        acctHolderName: {
            type: String,
            default : ''
        },
    },
    documnetsDetails: {  // all images
        _id : false,
        idcardfromfront: {
            type: String,
            default: ''
        },
        idcardfromback: {
            type: String,
            default: ''
        },
        driversLisence: {
            type: String,
            default: ''
        },
        vehicleownership: {
            type: String,
            default: ''
        },
    },
    pendingOrders: [{
        type: mongoose.Types.ObjectId,
        ref: 'oturqapporders',
    }],
    completedOrders: [{
        type: mongoose.Types.ObjectId,
        ref: 'oturqapporders',
    }],
    availOrders: [{
        type: mongoose.Types.ObjectId,
        ref: 'oturqapporders',
    }],
    ordersDelivered: {
        type: Number,
        default: '0'
    },
    sales: {
        type: Number,
        default: '0'
    },
    ordersRejected: {
        type: Number,
        default: '0'
    },
    ordersRecieved: {
        type: Number,
        default: '0'
    },
    availCash: {
        type: Number,
        default : '0'
    },
    profilePic: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
    },
    curntLoc: { // location of driver
        type: Array
    },
    activeStatus: { // location of driver
        type: Boolean,
        default : false
    },
    pushNotification: {
        type: String,
        default: ''
    },
    gotResponseFromCust : [{
        type: mongoose.Types.ObjectId,
        ref: 'oturqapporders',
    }],
    widthDrawlDate : {
        type : Date,
        default : null
    }
}, {
    timestamps: true
});


const OturqAppDrivers = mongoose.model('OturqAppDrivers', DriverSchema);

module.exports = OturqAppDrivers