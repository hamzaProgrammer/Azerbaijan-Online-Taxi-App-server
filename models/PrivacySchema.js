const mongoose = require("mongoose");

const PrivacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    date: {
        type: String
    }
}, {
    timestamps: true
});


const OturqAppPrivacy = mongoose.model('OturqAppPrivacy', PrivacySchema);

module.exports = OturqAppPrivacy