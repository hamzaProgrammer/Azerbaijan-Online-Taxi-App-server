const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});


const OturqAppRegions = mongoose.model('OturqAppRegions', RegionSchema);

module.exports = OturqAppRegions