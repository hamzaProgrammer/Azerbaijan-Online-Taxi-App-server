const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});


const OturqAppServices = mongoose.model('OturqAppServices', ServicesSchema);

module.exports = OturqAppServices