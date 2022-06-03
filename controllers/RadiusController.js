const Radiuses = require('../models/RadiusSchema')


// update single radius
const updateSingleRadius = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let isExist = await Radiuses.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Service Not Found"
            })
        }
        isExist.radius = req.body.radius;

        await Radiuses.findByIdAndUpdate(id , {$set : {...isExist}} , {new : true})
        return res.json({
            success: true,
            singleService: isExist
        })
    } catch (error) {
        console.log("Error in updateSingleRadius and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This Service"
        });
    }
}

// getting all radius
const getRadiuses = async (req, res) => {
    try {
        let isExist = await Radiuses.find({});

        if (!isExist) {
            return res.json({
                success: false,
                message: "Radius Not Found"
            })
        }
        return res.json({
            success: true,
            AllRadius: isExist
        })
    } catch (error) {
        console.log("Error in getRadiuses and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Radiuses"
        });
    }
}

// getting single radius
const getSingleRadiuses = async (req, res) => {
    const {id} = req.params;
    try {
        let isExist = await Radiuses.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Radius Not Found"
            })
        }
        return res.json({
            success: true,
            isExist
        })
    } catch (error) {
        console.log("Error in getSingleRadiuses and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get Radius"
        });
    }
}


module.exports = {
    getRadiuses,
    updateSingleRadius,
    getSingleRadiuses,
}