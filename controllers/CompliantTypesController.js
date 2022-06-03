const ComplaintsTypes = require('../models/ComplaintTypesSchema')

// Add complait type
const addComplaintType = async (req, res) => {
    const {name} = req.body;
    if(!name) {
        return res.json({
            success: false,
            message: "ComplaintsTypes Name Not Found"
        })
    }
    try {
        let isExist = await ComplaintsTypes.findOne({name : name});
        if (isExist) {
            return res.json({
                success: false,
                message: "ComplaintsTypes Already Exists "
            })
        }
        const newAnn = new ComplaintsTypes({
            ...req.body,
        })

        await newAnn.save();
        return res.json({
            success: true,
            message : "Successfully Added"
        })
    } catch (error) {
        console.log("Error in AddComplaintsTypes and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not add New complaint Type"
        });
    }
}

// update single ComplaintsTypes
const updateSingleComplaintsTypes = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let isExist = await ComplaintsTypes.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Announcement Not Found"
            })
        }
        isExist.name = req.body.name;

        await ComplaintsTypes.findByIdAndUpdate(id , {$set : {...isExist}} , {new : true})
        return res.json({
            success: true,
            message : "Updated SuccessFully"
        })
    } catch (error) {
        console.log("Error in updateSingleComplaintsTypes and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This ComplaintsType"
        });
    }
}

// getting all complaint Types
const getAllComplaintTypes = async (req, res) => {
    try {
        let isExist = await ComplaintsTypes.find({});

        if (!isExist) {
            return res.json({
                success: false,
                message: "ComplaintsTypes Not Found"
            })
        }
        return res.json({
            success: true,
            AllAnnouncements: isExist
        })
    } catch (error) {
        console.log("Error in getAllComplaintTypes and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get ComplaintsTypes"
        });
    }
}

// getting single ComplaintsTypes
const getSingleComplaintsTypes = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await ComplaintsTypes.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "ComplaintsTypes Not Found"
            })
        }
        return res.json({
            success: true,
            Announcement : isExist
        })
    } catch (error) {
        console.log("Error in getSingleComplaintsTypes and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get ComplaintsTypes"
        });
    }
}

// deletung single comaplaint types
const delSingleComplaintType = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await ComplaintsTypes.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "ComplaintsTypes Not Found"
            })
        }
        await ComplaintsTypes.findByIdAndDelete(id)
        return res.json({
            success: true,
            message : "SuccessFully deleted"
        })
    } catch (error) {
        console.log("Error in delSingleComplaintType and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Radius"
        });
    }
}


// get all announcements  Count
const getAllComplaintsTypesCount = async (req, res) => {
    try {
        const count = await ComplaintsTypes.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No ComplaintsTypes Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllComplaintsTypesCount and error is : ", error)
        return res.json({
            success: false,
            message: "Could not get All ComplaintsTypes Count"
        });
    }
}

module.exports = {
    addComplaintType,
    getAllComplaintTypes,
    updateSingleComplaintsTypes,
    getSingleComplaintsTypes,
    delSingleComplaintType,
    getAllComplaintsTypesCount,
}