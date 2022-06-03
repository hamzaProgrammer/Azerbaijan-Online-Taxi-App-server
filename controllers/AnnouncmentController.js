const Announcments = require('../models/AnnouncementSchema')

// Add Announcment
const addAnnouncement = async (req, res) => {
    const {name} = req.body;
    const crntDate = new Date();
    let date = crntDate.getFullYear() + "-" + crntDate.getMonth() + "-" + crntDate.getDate();

    if(!name) {
        return res.json({
            success: false,
            message: "Announcement Name Not Found"
        })
    }
    try {
        let isExist = await Announcments.findOne({name : name});
        if (isExist) {
            return res.json({
                success: false,
                message: "Announcment Already Exists "
            })
        }
        req.body.date = date;
        const newAnn = new Announcments({
            ...req.body,
        })

        await newAnn.save();
        return res.json({
            success: true,
            message : "Successfully Added"
        })
    } catch (error) {
        console.log("Error in updateSingleAnnouncement and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This Service"
        });
    }
}

// update single announcements
const updateSingleAnnouncement = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let isExist = await Announcments.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Announcement Not Found"
            })
        }
        isExist.name = req.body.name;
        isExist.details = req.body.details;

        await Announcments.findByIdAndUpdate(id , {$set : {...isExist}} , {new : true})
        return res.json({
            success: true,
            message : "Updated SuccessFully"
        })
    } catch (error) {
        console.log("Error in updateSingleAnnouncement and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This Service"
        });
    }
}

// getting all annouccements
const getAnnouncments = async (req, res) => {
    try {
        let isExist = await Announcments.find({});

        if (!isExist) {
            return res.json({
                success: false,
                message: "Announcments Not Found"
            })
        }
        return res.json({
            success: true,
            AllAnnouncements: isExist
        })
    } catch (error) {
        console.log("Error in getAnnouncments and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Announcements"
        });
    }
}

// getting single Announcements
const getSingleAnnoncements = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await Announcments.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Announcment Not Found"
            })
        }
        return res.json({
            success: true,
            Announcement : isExist
        })
    } catch (error) {
        console.log("Error in getSingleAnnoncements and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Radius"
        });
    }
}

// deletung single Announcements
const delSingleAnnoncements = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await Announcments.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Announcment Not Found"
            })
        }
        await Announcments.findByIdAndDelete(id)
        return res.json({
            success: true,
            message : "SuccessFully deleted"
        })
    } catch (error) {
        console.log("Error in delSingleAnnoncements and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Radius"
        });
    }
}


// get all announcements  Count
const getAllAnnouncementsCount = async (req, res) => {
    try {
        const count = await Announcments.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Announcments Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllAnnouncementsCount and error is : ", error)
        return res.json({
            success: false,
            message: "Could not get All Announcements Count"
        });
    }
}

module.exports = {
    addAnnouncement,
    getAnnouncments,
    updateSingleAnnouncement,
    getSingleAnnoncements,
    delSingleAnnoncements,
    getAllAnnouncementsCount,
}