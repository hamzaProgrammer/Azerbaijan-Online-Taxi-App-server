const mongoose = require("mongoose");

const ComplaintTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});


const OturqAppCompliantTpes = mongoose.model('OturqAppCompliantTpes', ComplaintTypesSchema);

module.exports = OturqAppCompliantTpes