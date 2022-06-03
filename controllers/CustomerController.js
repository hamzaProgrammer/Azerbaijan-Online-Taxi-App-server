const Customers = require('../models/CustomerSchema')
// const PlayLists = require('../models/PlayListSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const stripe = require('stripe')(process.env.Stripe_Secret_key)
const URL = "http://localhost:8080"
const nodeMailer = require("nodemailer");



// Sign In user  (New Api)
const SignInUser = async (req, res) => {
    const {
        phoneNo
    } = req.body;

    if (!phoneNo) {
        return res.json({
            success: false,
            message: "Phone No Not Found"
        });
    } else {
        // checking if phone is complete or not
        let no = phoneNo.toString()
        if (no.length > 12) {
            return res.json({
                success: false,
                message: "Phone No is InValid Found"
            });
        }

        let check = await Customers.find({
                phoneNo: phoneNo
            })

        // if customer already exists
        if (check.length > 0) {
            let isExist = await Customers.findOne({phoneNo : phoneNo} , {fullname : 1 , lastname : 1 , phoneNo : 1 , whatsAppNo : 1 , profilePic : 1 , verifyStatus : 1})

            if (isExist.verifyStatus === false) {
                return res.json({
                    success: false,
                    message: "User Can Not Sign In, As User has Not Been Verified Yet"
                })
            }

            const token = jwt.sign({
                id: isExist._id
            }, JWT_SECRET_KEY, {
                expiresIn: '24h'
            }); // gentating token


             return res.json({
                 myResult: isExist,
                 success: true,
                 token
             });
        } else {
            let newUser = new Customers({
                    ...req.body
                })

            try {
                await newUser.save();

                res.status(201).json({
                    succes: true,
                    userId : newUser._id,
                    message: 'User SuccessFully Added'
                })
            } catch (error) {
                console.log("Error in addNewUser and error is : ", error)
                res.status(201).json({
                    success: false,
                    error
                })
            }
        }
    }
}

// Sign In user Admin
const SignInUserAdmin = async (req, res) => {
     const {phoneNo} = req.body;

    if (!phoneNo) {
        return res.json({
            success: false,
            message: "Phone No Not Found"
        });
    } else {
        let check = await Customers.findOne({
            phoneNo: phoneNo
        })

        if (check){
            return res.status(201).json({
                success: false,
                message: "User Already Exists with Same Phone No"
            })
        }

        let newUser = new Customers({
                ...req.body
            })

        try {
            await newUser.save();

            res.status(201).json({
                success: true,
                //userId : newUser._id,
                message: 'User SuccessFully Added'
            })
        } catch (error) {
            console.log("Error in addNewUser and error is : ", error)
            res.status(201).json({
                success: false,
                message : "Action Could Not Be Performed"
            })
        }
}
}

// Logging In User
const LogInUser = async (req, res) => {
    const {phoneNo} = req.body

    if (!phoneNo) {
        return res.json({
            success: false,
            message: "Phone No Not Found"
        })
    } else {
        try {
            let no = phoneNo.toString()
            if (no.length > 12) {
                return res.json({
                    success: false,
                    message: "InValid Phone No"
                });
            }

            let isExist = await Customers.findOne({phoneNo : phoneNo} , {fullname : 1 , lastname : 1 , phoneNo : 1 , whatsAppNo : 1 , profilePic : 1 , verifyStatus : 1})


            if (!isExist) {
                return res.json({
                    success: false,
                    message: "User Not Found"
                })
            }

            if (isExist.verifyStatus === false) {
                return res.json({
                    success: false,
                    message: "User Can Not Sign In, As User has Not Been Verified Yet"
                })
            }

            const token = jwt.sign({
                id: isExist._id
            }, JWT_SECRET_KEY, {
                expiresIn: '24h'
            }); // gentating token

            return res.json({
                myResult: isExist,
                success: true,
                token
            });
        } catch (error) {
            console.log("Error in LogInUser and error is : ", error)
            return res.json({
                success: false,
                error
            });
        }
    }

}

// uodate user code
const updateUserStatus = async (req, res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Customer Id Not found'
        })
    } else {
        let isExist = await Customers.findById(id)

        if (!isExist) {
            return res.json({
                success: false,
                message: 'Customer Id may be Incorrect'
            })
        } else {
            try {
                // checking if user has already been verified
                if (isExist.verifyStatus !== true){
                    isExist.verifyStatus = true;
                    await Customers.findByIdAndUpdate(id, { $set: isExist}, { new: true})

                    res.status(201).json({
                        success: true,
                        message : "User Verification Status Changed. User can Now Sign In"
                    })
                }else{
                    res.status(201).json({
                        success: true,
                        message: "User has Already been Verfied"
                    })
                }
            } catch (error) {
                console.log("Error in updateUserStatus and error is : ", error)
                return res.status(201).json({
                    message: 'Opps An Error Occured',
                    success: false,
                })
            }
        }
    }
}

// uodate Customer Info Only
const updateCustomer = async (req, res) => {
    const {
        id
    } = req.params

    // checking sent file is image or not
    if (req.file) {
            return res.json({
                success: false,
                message: "You Can Not Send Image Here"
            });
    }

    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data for Updation'
        })
    }

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation '
        })
    } else {
        const isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Customer Id is Incorrect '
            })
        } else {
            try {
                await Customers.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateCustomer and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// update Customer prfile image only Info Only
const updateCustomerProfileImg = async (req, res) => {
    const {
        id
    } = req.params

    // checking if user has sent any data for updating or not
    if (!req.file) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Image'
        })
    }


    // checking sent file is image or not
    if (req.file) {
        if ((req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/jpg" && req.file.mimetype !== "image/webP" && req.file.mimetype !== "image/png")) {
            return res.json({
                success: false,
                message: "Profile Image Not Found"
            });
        }
    }

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation '
        })
    } else {
        let isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Merchent Id is Incorrect '
            })
        } else {
            try {
                // uploading user profile iamge to multer
                if (req.file) {
                    var lower = req.file.filename.toLowerCase();
                    isExist.profilePic = URL + "/customerPics/" + lower;
                }
                await Customers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateCustomer and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// uodate Customer location
const updateCustLocation = async (req, res) => {
    const {
        id
    } = req.params
    const {curntLoc , currentAddress} = req.body;

    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data'
        })
    }

    if (!id || !curntLoc || !currentAddress) {
        return res.status(504).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    } else {
        let  isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Customer Id is Incorrect'
            })
        } else {
            try {
                if (isExist.verifyStatus === false){
                    return res.status(201).json({
                        success: false,
                        message: 'Sorry Operation Could Not Performed as this Customer has not been Verified By this App yet'
                    })
                }
                isExist.curntLoc = curntLoc;
                isExist.currentAddress = currentAddress;
                isExist.activeStatus = true;

                await Customers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateCustLocation and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// getting customer saved locations
const getUserSavedLocations = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Customer Id Not Found'
        })
    } else {
        let  isExist = await Customers.findById(id , {myLocations : 1 , _id : 0} )
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Customer Id is Incorrect'
            })
        } else {
            try {
                res.status(201).json({
                    success: true,
                    locations: isExist
                })

            } catch (error) {
                console.log("Error in getUserSavedLocations and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// getting customer saved locations
const AddUserNewLocations = async (req, res) => {
    const {
        id
    } = req.params
    const {location} = req.body;

    if (!id || !location) {
        return res.status(504).json({
            success: false,
            message: 'Please fill All Required Credientials'
        })
    } else {
        let  isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Customer Id is Incorrect'
            })
        }

        isExist = await Customers.findOne({_id : id , myLocations : { $elemMatch: { $eq : location } }} )
        console.log("isExist : ", isExist)
        if (isExist) {
            return res.status(201).json({
                success: false,
                message: 'Address Already Exists'
            })
        } else {
            try {
                await Customers.findByIdAndUpdate(id , {$push : {myLocations : location}} , {new : true})
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in AddUserNewLocations and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// deleteing from customer saved locations
const updateCustLocations = async (req, res) => {
    const {
        id
    } = req.params
    const {location} = req.body;

    if (!id || !location) {
        return res.status(504).json({
            success: false,
            message: 'Please fill All Required Credientials'
        })
    } else {
        let  isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Customer Id is Incorrect'
            })
        }

        isExist = await Customers.findOne({_id : id , myLocations : { $elemMatch: { $eq : location } }} )
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'This Address Does Not Exist'
            })
        } else {
            try {
                await Customers.findByIdAndUpdate(id , {$pull : {myLocations : location}} , {new : true})
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateCustLocations and error is : ", error)
                return res.status(504).json({
                    message: 'An Error Occured',
                    success: false
                })
            }
        }
    }
}

// uodate customer location
const updateCustomerLocation = async (req, res) => {
    const {
        id
    } = req.params
    const {curntLoc , currentAddress} = req.body;

    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data'
        })
    }

    if (!id || !curntLoc || !currentAddress) {
        return res.status(504).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    } else {
        let  isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Customer Id is Incorrect'
            })
        } else {
            try {
                if (isExist.verifyStatus === false){
                    return res.status(201).json({
                        success: false,
                        message: 'Sorry Could Not Place Order as this Driver has not been Verified By this App yet'
                    })
                }
                isExist.curntLoc = curntLoc;
                isExist.address = currentAddress;
                isExist.activeStatus = true;

                await Customers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateCustomerLocation and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// get all Merchents Count
const getAllMerchentsCount = async (req, res) => {
    try {
        const count = await Customers.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Merchent Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllMerchentsCount and error is : ", error)
        return res.json({
            success: false,
            message : "Could not get All Merchents Count"
        });
    }
}

// get all Merchents
const getAllMerchents = async (req, res) => {
    try {
        const allMerchents = await Customers.find({} , {createdAt : 0 , updatedAt : 0 , __v : 0});
        if (!allMerchents) {
            return res.json({
                success: false,
                message: 'No Merchent Found',
            });
        } else {
            return res.json({
                allMerchents,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllMerchents and error is : ", error)
        return res.json({
            success: false,
            message : "Could not get All Merchents"
        });
    }
}

// get merchnet profile info
const getSingleMerchent = async (req, res) => {
    const {id} = req.params
    try {
        const singleMerchent = await Customers.findOne({_id : id }, {firstname : 1 , country : 1 , profilePic : 1 , dateOfBirth :1 });
        if (!singleMerchent) {
            return res.json({
                success: false,
                message: 'No Merchent Found',
            });
        } else {
            return res.json({
                singleMerchent,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getSingleMerchent and error is : ", error)
        return res.json({
            success: false,
            message : "Could not get Merchent"
        });
    }
}

// update merchnet profile info
const UpdateSingleMerchent = async (req, res) => {
    const {id} = req.params
    try {
        let singleMerchent = await Customers.findById(id);
        if (!singleMerchent) {
            return res.json({
                success: false,
                message: 'No Merchent Found',
            });
        } else {
            if (req.body.firstname){
                console.log("done")
                singleMerchent.firstname = req.body.firstname
            }
            if (req.body.country){
                console.log("done")
                singleMerchent.country = req.body.country
            }
            if (req.file){
                console.log("done")
                singleMerchent.profilePic = URL + "/customerPics/" + req.file.filename
            }
            if (req.body.dateOfBirth){
                console.log("done")
                singleMerchent.dateOfBirth = req.body.dateOfBirth
            }
            console.log("singleMerchent : ", singleMerchent)
            await Customers.findByIdAndUpdate(id , {$set : {...singleMerchent}} , {new : true})
            return res.json({
                message : "Merchent Profile Updated SuccessFully",
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in UpdateSingleMerchent and error is : ", error)
        return res.json({
            success: false,
            message : "Could not get Merchent"
        });
    }
}

// get merchnet profile
const getMerchent = async (req, res) => {
    const {id} = req.params
    try {
        const singleMerchent = await Customers.findOne({_id : id }, { createdAt : 0 , updatedAt : 0 , __v : 0 });
        if (!singleMerchent) {
            return res.json({
                success: false,
                message: 'No Merchent Found',
            });
        } else {
            console.log("singleMerchent : ", singleMerchent.profilePic)
            return res.json({
                singleMerchent,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getMerchent and error is : ", error)
        return res.json({
            success: false,
            message : "Could not get Merchent"
        });
    }
}


module.exports = {
    SignInUser,
    LogInUser,
    updateUserStatus,
    updateCustomer,
    updateCustLocation,
    updateCustomerLocation,
    AddUserNewLocations,
    getUserSavedLocations,
    updateCustLocations,
    updateCustomerProfileImg,
    getAllMerchentsCount,
    getAllMerchents,
    getSingleMerchent,
    UpdateSingleMerchent,
    getMerchent,
    SignInUserAdmin
}