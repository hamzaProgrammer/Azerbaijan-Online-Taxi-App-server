const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    date : {
        type : String
    }
}, {
    timestamps: true
});


const OturqAppAnnouncements = mongoose.model('OturqAppAnnouncements', AnnouncementSchema);

module.exports = OturqAppAnnouncements