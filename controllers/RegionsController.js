const Regions = require('../models/RegionsSchema')

// Add Region
const addNewRegion = async (req, res) => {
    const {name} = req.body;
    if(!name) {
        return res.json({
            success: false,
            message: "ComplaintsTypes Name Not Found"
        })
    }
    try {
        let isExist = await Regions.findOne({name : name});
        if (isExist) {
            return res.json({
                success: false,
                message: "Region Already Exists "
            })
        }
        const newAnn = new Regions({
            ...req.body,
        })

        await newAnn.save();
        return res.json({
            success: true,
            message : "Successfully Added"
        })
    } catch (error) {
        console.log("Error in addNewRegion and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not add New Region"
        });
    }
}

// update single ComplaintsTypes
const updateSingleregion = async (req, res) => {
    const {
        id
    } = req.params;
    console.log("body : ", req.body)
    try {
        let isExist = await Regions.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Announcement Not Found"
            })
        }
        isExist.name = req.body.name;
        console.log("isExist : ", isExist)

        await Regions.findByIdAndUpdate(id , {$set : {...isExist}} , {new : true})
        return res.json({
            success: true,
            message : "Updated SuccessFully"
        })
    } catch (error) {
        console.log("Error in updateSingleregion and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This ComplaintsType"
        });
    }
}

// getting all regions
const getAllRegions = async (req, res) => {
    try {
        let isExist = await Regions.find({});
        if (!isExist) {
            return res.json({
                success: false,
                message: "Regions Not Found"
            })
        }
        return res.json({
            success: true,
            AllAnnouncements: isExist
        })
    } catch (error) {
        console.log("Error in getAllRegions and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get ComplRegionsaintsTypes"
        });
    }
}

// getting single Regions
const getSingleRegion = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await Regions.findOne({_id : id});
        if (!isExist) {
            return res.json({
                success: false,
                message: "Regions Not Found"
            })
        }
        return res.json({
            success: true,
            Announcement : isExist
        })
    } catch (error) {
        console.log("Error in getSingleRegion and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Region"
        });
    }
}

// deletung single comaplaint types
const delSingleRegion = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await Regions.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Regions Not Found"
            })
        }
        await Regions.findByIdAndDelete(id)
        return res.json({
            success: true,
            message : "SuccessFully deleted"
        })
    } catch (error) {
        console.log("Error in delSingleRegion and error is : ", error)
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
    addNewRegion,
    getAllRegions,
    updateSingleregion,
    getSingleRegion,
    delSingleRegion,
    // getAllComplaintsTypesCount,
}