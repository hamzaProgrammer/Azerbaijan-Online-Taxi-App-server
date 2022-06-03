const Services = require('../models/ServivesSchema')


// add new service
const addNewService = async (req, res) => {
    const {name , price} = req.body;

    if (!name || !price) {
        return res.json({
            success: false,
            message: "Please Provide All Credientials"
        });
    } else {
        // if service already exists
        const isExist = await Services.findOne({
            name: name
        })
        if (isExist) {
            return res.json({
                success: false,
                message : "Service Already Exists"
            });
        }
        const newService = new Services({
            ...req.body,
        })

        try {
            await newService.save();

            res.status(201).json({
                success: true,
                message: 'Service SuccessFully Added'
            })
        } catch (error) {
            console.log("Error in addNewService and error is : ", error)
            res.status(201).json({
                success: false,
                message : "Could Not Add New Service"
            })
        }
    }
}

// get all services
const getAllServices = async (req, res) => {
        try {
            const isExist = await Services.find({});

            if (!isExist) {
                return res.json({
                    success: false,
                    message: "Services Not Found"
                })
            }
            return res.json({
                success: true,
                allServices : isExist
            });
        } catch (error) {
            console.log("Error in getAllServices and error is : ", error)
            return res.json({
                success: false,
                message : "Could Not get All Services"
            });
        }
}

// get single services
const getSingleServices = async (req, res) => {
    const {id} = req.params;
    try {
        const isExist = await Services.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Services Not Found"
            })
        }
        return res.json({
            success: true,
            singleService: isExist
        });
    } catch (error) {
        console.log("Error in getSingleServices and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This Service"
        });
    }
}

// update single services
const updateSingleServices = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let isExist = await Services.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Service Not Found"
            })
        }
        isExist.name = req.body.name;
        isExist.price = req.body.price;
        await Services.findByIdAndUpdate(id , {$set : {...isExist}} , {new : true})
        return res.json({
            success: true,
            singleService: isExist
        })
    } catch (error) {
        console.log("Error in updateSingleServices and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not get This Service"
        });
    }
}

// selete single services
const deleteService = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let isExist = await Services.findById(id);

        if (!isExist) {
            return res.json({
                success: false,
                message: "Service Not Found"
            })
        }
        await Services.findByIdAndDelete(id)
        return res.json({
            success: true,
            message : "Service Deleted SuccessFully"
        })
    } catch (error) {
        console.log("Error in deleteService and error is : ", error)
        return res.json({
            success: false,
            message: "Could Not Delete This Service"
        });
    }
}

// get all services  Count
const getAllServicesCount = async (req, res) => {
    try {
        const count = await Services.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Services Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllServicesCount and error is : ", error)
        return res.json({
            success: false,
            message: "Could not get All Services Count"
        });
    }
}


module.exports = {
    addNewService,
    getAllServices,
    getSingleServices,
    updateSingleServices,
    deleteService,
    getAllServicesCount
}