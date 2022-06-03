const mongoose = require("mongoose");

const RadiusSchema = new mongoose.Schema({
    radius: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});


const OturqAppRadius = mongoose.model('OturqAppRadius', RadiusSchema);

module.exports = OturqAppRadius