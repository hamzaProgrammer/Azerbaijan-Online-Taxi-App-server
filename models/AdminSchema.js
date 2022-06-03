const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    availCash: {
        type: Number,
        default: '0'
    },
}, {
    timestamps: true
});


const OturqAppAdmins = mongoose.model('OturqAppAdmins', AdminSchema);

module.exports = OturqAppAdmins