const Drivers = require('../models/DriverSchema')
const Vehicles = require('../models/VehicleSchema')
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
//const stripe = require('stripe')(process.env.Stripe_Secret_key)
const URL = "http://localhost:8080"
const nodeMailer = require("nodemailer");


// Sign Up/Sign In
const signInDriver = async (req, res) => {
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

        let check = await Drivers.find({
            phoneNo: phoneNo
        })

        if (check.length > 0) {
            let isExist = await Drivers.findOne({
                phoneNo: phoneNo
            }, {
                name: 1,
                familyName: 1,
                phoneNo: 1,
                whatsAppNo: 1,
                profilePic: 1,
                verifyStatus: 1
            })


            if (!isExist) {
                return res.json({
                    success: false,
                    message: "Driver Not Found"
                })
            }

            if (isExist.verifyStatus === false) {
                return res.json({
                    success: false,
                    message: "Driver Can Not Sign In, As Driver has Not Been Verified Yet"
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
            let newUser = new Drivers({
                ...req.body
            })

            try {
                await newUser.save();

                res.status(201).json({
                    succes: true,
                    userId: newUser._id,
                    message: 'Driver SuccessFully Added'
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

// Logging In User
const LogInUser = async (req, res) => {
    const {
        phoneNo
    } = req.body

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

            let isExist = await Drivers.findOne({
                phoneNo: phoneNo
            }, {
                name: 1,
                familyName: 1,
                phoneNo: 1,
                whatsAppNo: 1,
                profilePic: 1,
                verifyStatus: 1
            })


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
    const {
        id
    } = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Please Fill All Required Credientials'
        })
    } else {
        let isExist = await Drivers.findById(id)

        if (!isExist) {
            return res.json({
                success: false,
                message: 'Customer Id may be Incorrect'
            })
        } else {
            try {
                // checking if user has already been verified
                if (isExist.verifyStatus !== true) {
                    isExist.verifyStatus = true;
                    await Drivers.findByIdAndUpdate(id, {
                        $set: isExist
                    }, {
                        new: true
                    })

                    res.status(201).json({
                        success: true,
                        message: "User Verification Status Changed. User can Now Sign In"
                    })
                } else {
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

// uodate Driver Documents only
const addDriverDocs = async (req, res) => {
    const {
        id
    } = req.params


    // checking if there are any files recieved
    if (!req.files && !req.file) {
        return res.json({
            success: false,
            message: "No Documents Images Found"
        });
    }

    // checking if any image is remaining or not
    // if (!req.files.idcardfromfront || !req.files.idcardfromback || !req.files.driversLisence || !req.files.vehicleownership) {
    //     return res.json({
    //         success: false,
    //         message: "Some Documents Image Not Found"
    //     });
    // }

    // checking sent file is image or not
    if (req.files) {
        // checking id card front image
        if(req.files.idcardfromfront){
            if ((req.files.idcardfromfront[0].mimetype !== "image/jpeg" && req.files.idcardfromfront[0].mimetype !== "image/jpg" && req.files.idcardfromfront[0].mimetype !== "image/webP" && req.files.idcardfromfront[0].mimetype !== "image/png")) {
                return res.json({
                    success: false,
                    message: "Id Card Front Image Not Found"
                });
            }
        }

        // checking id card back image
        if(req.files.idcardfromback){
            if ((req.files.idcardfromback[0].mimetype !== "image/jpeg" && req.files.idcardfromback[0].mimetype !== "image/jpg" && req.files.idcardfromback[0].mimetype !== "image/webP" && req.files.idcardfromback[0].mimetype !== "image/png")) {
                return res.json({
                    success: false,
                    message: "Id Card Back Image Not Found"
                });
            }
        }

        // checking Lisence image
        if (req.files.driversLisence){
            if ((req.files.driversLisence[0].mimetype !== "image/jpeg" && req.files.driversLisence[0].mimetype !== "image/jpg" && req.files.driversLisence[0].mimetype !== "image/webP" && req.files.driversLisence[0].mimetype !== "image/png")) {
                return res.json({
                    success: false,
                    message: "Lisence Image Not Found"
                });
            }
        }

        // checking OwnerShip image
        if (req.files.vehicleownership){
            if ((req.files.vehicleownership[0].mimetype !== "image/jpeg" && req.files.vehicleownership[0].mimetype !== "image/jpg" && req.files.vehicleownership[0].mimetype !== "image/webP" && req.files.vehicleownership[0].mimetype !== "image/png")) {
                return res.json({
                    success: false,
                    message: "OwnerShip Image Not Found"
                });
            }
        }
    }


    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // uploading user profile iamge to multer
                if (req.files) {
                    let documnetsDetails = {};
                    if (req.files.idcardfromfront) {
                        documnetsDetails.idcardfromfront = URL + "/driverPics/" + req.files.idcardfromfront[0].filename.toLowerCase()
                    }
                    if (req.files.idcardfromback){
                        documnetsDetails.idcardfromback = URL + "/driverPics/" + req.files.idcardfromback[0].filename.toLowerCase()
                    }
                    if(req.files.driversLisence){
                        documnetsDetails.driversLisence = URL + "/driverPics/" + req.files.driversLisence[0].filename.toLowerCase()
                    }
                    if (req.files.vehicleownership){
                        documnetsDetails.vehicleownership = URL + "/driverPics/" + req.files.vehicleownership[0].filename.toLowerCase()
                    }

                    // sending data to array of vehicles
                    req.body.documnetsDetails = {};
                    req.body.documnetsDetails = documnetsDetails;
                }

                await Drivers.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in addDriverDocs and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// Sign In user Admin
const SignInUserAdmin = async (req, res) => {
     const {phoneNo } = req.body;

    if (!phoneNo) {
        return res.json({
            success: false,
            message: "Phone No Not Found"
        });
    } else {
        let check = await Drivers.findOne({
            phoneNo: phoneNo
        })
        console.log("check : ", check)
        if (check) {
            return res.status(201).json({
                success: false,
                message: "User Already Exists with Same Phone No"
            })
        }

        let newUser = new Drivers({
                ...req.body
            })

        try {
            await newUser.save();


            res.status(201).json({
                success: true,
                //userId : newUser._id,
                message: 'User SuccessFully Added and Mail Sent to User SuccessFully'
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

// get driver singel documents
const getDriverDocs = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                res.status(201).json({
                    success: true,
                    Details : {
                        IdCardFromFront: isExist.documnetsDetails.idcardfromfront,
                        IdCardFromBack: isExist.documnetsDetails.idcardfromback,
                        Driver_Lisence: isExist.documnetsDetails.driversLisence,
                        vehicle_OwnerShip: isExist.documnetsDetails.vehicleownership,
                    }
                })

            } catch (error) {
                console.log("Error in getDriverDocs and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// uodate Driver Info Only not profile
const addDriverDetails = async (req, res) => {
    const {
        id
    } = req.params
    const {
        name,
        familyName,
        whatsAppNo,
        gender,
        address,
    } = req.body

    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data for Updation'
        })
    }


    if (!id || !name || !familyName || !whatsAppNo || !gender || !address) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // checking if name is available or not
                const checkIsExist = await Drivers.findOne({
                    name: name,
                    _id: {
                        $ne: id
                    }
                })
                if (checkIsExist) {
                    return res.status(201).json({
                        success: false,
                        message: 'Name Already Exists'
                    })
                }

                await Drivers.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in addDriverDetails and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// uodate Driver Info Only not profile
const updateDriverDetails = async (req, res) => {
    const {
        id
    } = req.params

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
            message: 'Id is Required for Updation'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                if (req.body.name) {
                    // checking if name is available or not
                    let checkIsExist = await Drivers.findOne({
                        name: req.body.name,
                        _id: {
                            $ne: id
                        }
                    })
                    if (checkIsExist) {
                        return res.status(201).json({
                            success: false,
                            message: 'Name Already Exists'
                        })
                    }
                    isExist.name = req.body.name
                }
                if (req.body.familyName) {
                    isExist.familyName = req.body.familyName
                }
                if (req.body.whatsAppNo) {
                    isExist.whatsAppNo = req.body.whatsAppNo
                }
                if (req.body.gender) {
                    isExist.gender = req.body.gender
                }
                if (req.body.address) {
                    isExist.address = req.body.address
                }



                await Drivers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateDriver and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// get driver personel details
const getDriverPersonelDetails = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // checking if name is available or not
                const checkIsExist = await Drivers.findById(id, {
                    name: 1,
                    familyName: 1,
                    gender: 1,
                    address: 1,
                    whatsAppNo: 1,
                    _id: 1
                })
                if (!checkIsExist) {
                    return res.status(201).json({
                        success: false,
                        message: 'No User Found'
                    })
                }

                res.status(201).json({
                    success: true,
                    checkIsExist
                })

            } catch (error) {
                console.log("Error in updateDriver and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// get driver vehicles details
const getDriverVehiclesDetails = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // checking if name is available or not
                const checkIsExist = await Vehicles.find({
                    owner: id
                }, {
                    owner: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                })
                if (!checkIsExist) {
                    return res.status(201).json({
                        success: false,
                        message: 'No Vehicle Registered for this Driver'
                    })
                }

                res.status(201).json({
                    success: true,
                    allVehicles: checkIsExist
                })

            } catch (error) {
                console.log("Error in updateDriver and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// get driver single vehicles detail
const getDriverSingleVehicleDetails = async (req, res) => {
    const {
        id,
        owner
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(owner)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // checking if name is available or not
                const checkIsExist = await Vehicles.findOne({
                    _id: id,
                    owner: owner
                }, {
                    owner: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                })
                if (!checkIsExist) {
                    return res.status(201).json({
                        success: false,
                        message: 'Not Found'
                    })
                }

                res.status(201).json({
                    success: true,
                    singleVehicle: checkIsExist
                })

            } catch (error) {
                console.log("Error in updateDriver and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// update driver single vehicles detail
const updateDriverSingleVehicleDetails = async (req, res) => {
    const {
        id,
        owner
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(owner)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // checking if name is available or not
                const checkIsExist = await Vehicles.findOne({
                    _id: id,
                    owner: owner
                })
                if (!checkIsExist) {
                    return res.status(201).json({
                        success: false,
                        message: 'Not Vehicle On This Driver  Found'
                    })
                }

                req.body.owner = owner;
                await Vehicles.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                });

                res.status(201).json({
                    success: true,
                    message: "Vehicle Details Updated SuccessFully"
                })

            } catch (error) {
                console.log("Error in updateDriver and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// uodate Driver Info Only not profile
const updateDriverCarDetails = async (req, res) => {
    const {
        id
    } = req.params
    const {
        vehicleType,
        plateNo,
        plateCode,
        yearOfManuf,
        companyOfManuf,
        vehicleColor,
    } = req.body

    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data for Updation'
        })
    }



    if (!id || !vehicleType || !plateNo || !plateCode || !yearOfManuf || !companyOfManuf || !vehicleColor) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // chceking if vehicle with same plate no is already reg or not
                const checkPlateNo = await Drivers.findOne({
                    "vehicleDetails.plateNo": plateNo,
                    _id: {
                        $ne: id
                    }
                })
                if (checkPlateNo) {
                    return res.status(201).json({
                        success: false,
                        message: 'Vehicle with Same Plate No is Already Registered'
                    })
                }

                // adding vehhicles details
                let vehicleDetails = {};
                vehicleDetails.vehicleType = vehicleType;
                vehicleDetails.plateNo = plateNo;
                vehicleDetails.plateCode = plateCode;
                vehicleDetails.yearOfManuf = yearOfManuf;
                vehicleDetails.companyOfManuf = companyOfManuf;
                vehicleDetails.vehicleColor = vehicleColor;

                req.body.vehicleDetails = [];
                req.body.vehicleDetails.push(vehicleDetails);

                const updatedUser = await Drivers.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateDriverDocuments and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// uodate Driver payment details
const addDriverPaymentDetails = async (req, res) => {
    const {
        id
    } = req.params
    const {
        bankName,
        accountNo,
        acctHolderName,
    } = req.body



    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data for Updation'
        })
    }


    if (!id || !bankName || !accountNo || !acctHolderName) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // chceking if account no already exists or not
                const checkAccountNo = await Drivers.findOne({
                    "paymentDetails.accountNo": accountNo,
                    _id: {
                        $ne: id
                    }
                })
                if (checkAccountNo) {
                    return res.status(201).json({
                        success: false,
                        message: 'Driver with Same Account No is Already Registered'
                    })
                }

                // adding payment details
                let paymentDetails = {};
                paymentDetails.bankName = bankName;
                paymentDetails.accountNo = accountNo;
                paymentDetails.acctHolderName = acctHolderName;

                req.body.paymentDetails = {}
                req.body.paymentDetails = paymentDetails;

                await Drivers.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in addDriverPaymentDetails and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// get Driver payment details
const getDriverPaymentDetails = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required'
        })
    } else {
        const isExist = await Drivers.findById(id, {
            "paymentDetails.bankName" : 1,
            "paymentDetails.accountNo" : 1,
            "paymentDetails.acctHolderName" : 1,
            _id: 1
        })
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                res.status(201).json({
                    success: true,
                    Details : {
                       isExist
                    }
                })

            } catch (error) {
                console.log("Error in getDriverPaymentDetails and error is : ", error)
                return res.status(504).json({
                    message: 'Opps An Error Occured',
                    success: false
                })
            }
        }
    }
}

// uodate Driver Profile Pic or Info
const updateDriverProfile = async (req, res) => {
    const {
        id
    } = req.params
    // checking sent file is image or not
    if (req.file) {
            return res.json({
                success: false,
                message: "You Can Not Send Image here"
            });
    }


    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                if (req.body.firstName) {
                    isExist.firstName = req.body.firstName;
                }

                if (req.body.lastName) {
                    isExist.lastName = req.body.lastName;
                }

                await Drivers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateDriverProfile and error is : ", error)
                return res.status(504).json({
                    message: 'Some Server Side Error Occured',
                    success: false
                })
            }
        }
    }
}

// uodate Driver Profile Pic only
const updateDriverProfilePicOnly  = async (req, res) => {
    const {
        id
    } = req.params
    // checking sent file is image or not
    if (req.file) {
        // checking id card front image
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
            message: 'Id is Required for Updation'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                // uploading user profile iamge to multer
                if (req.file) {
                    // updating profile pic
                    isExist.profilePic = "";
                    isExist.profilePic = URL + "/driverPics/" + req.file.filename.toLowerCase()
                }

                await Drivers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateDriverProfile and error is : ", error)
                return res.status(504).json({
                    message: 'Driver Profile Pic Could Not Be Updated',
                    success: false
                })
            }
        }
    }
}

// get Driver Profile Pic or Info
const getDriverProfile = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        const isExist = await Drivers.findById(id, {
            firstName: 1,
            lastName: 1,
            profilePic: 1,
            _id: 1
        })
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                res.status(201).json({
                    success: true,
                    Details: {
                        FirstName: isExist.firstName,
                        LastName: isExist.lastName,
                        ProfilePic: isExist.profilePic,
                    }
                })

            } catch (error) {
                console.log("Error in getDriverProfile and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// Adding new vehcle
const addNewVehicle = async (req, res) => {
    const {
        id
    } = req.params
    const {
        vehicleType,
        plateNo,
        plateCode,
        yearOfManuf,
        companyOfManuf,
        vehicleColor,
    } = req.body


    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data for Updation'
        })
    }


    if (!id || !vehicleType || !plateNo || !plateCode || !yearOfManuf || !companyOfManuf || !vehicleColor) {
        return res.status(504).json({
            success: false,
            message: 'Please provide all Requred Credientials'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect'
            })
        } else {
            try {

                // chceking if vehicle with same plate no is already reg or not
                const checkPlateNo = await Vehicles.find({
                    plateNo: plateNo
                })
                if (checkPlateNo.length > 0) {
                    return res.status(201).json({
                        success: false,
                        message: 'Vehicle with Same Plate No is Already Registered'
                    })
                }

                let newVehicle = new Vehicles({
                    owner: id,
                    ...req.body
                })

                const addedVehicle = await newVehicle.save();


                // updating driver modal
                await Drivers.findByIdAndUpdate(id, {
                    $push: {
                        vehicleDetails: addedVehicle._id
                    }
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in addNewVehicle and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// uodate Driver location / show active
const updateDriverLocation = async (req, res) => {
    const {
        id
    } = req.params
    const {
        curntLoc,
        currentAddress
    } = req.body;

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
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect'
            })
        } else {
            try {
                if (isExist.verifyStatus === false) {
                    return res.status(201).json({
                        success: false,
                        message: 'Sorry Action Could Not be Performed as  Driver has not been Verified By this App yet'
                    })
                }
                isExist.curntLoc = curntLoc;
                isExist.address = currentAddress;
                isExist.activeStatus = true;

                await Drivers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateDriverLocation and error is : ", error)
                return res.status(504).json({
                    message: '!!! Opps An Error Occured !!!',
                    success: false
                })
            }
        }
    }
}

// uodate Driver Notifictions
const getDriverNotifications = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Driver Id Not Found'
        })
    } else {
        let isExist = await Drivers.findById(id);
        const newDate = new Date()
        const msToTime = (ms) => ({
            hours: Math.trunc(ms / 3600000),
            minutes: Math.trunc((ms / 3600000 - Math.trunc(ms / 3600000)) * 60) + ((ms / 3600000 - Math.trunc(ms / 3600000)) * 60 % 1 != 0 ? 1 : 0)
        })

        // Update header text
        //const res = msToTime(newDate - oldDate)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect'
            })
        } else {
            try {
                let Notifications = await Drivers.aggregate([{
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                        },
                    },
                    {
                        $lookup: {
                            from: 'oturqapporders',
                            localField: 'completedOrders',
                            foreignField: '_id',
                            as: 'availOrders'
                        },
                    },
                    {
                        $unwind: "$availOrders"
                    },
                    {
                        $project: {
                            _id: "$availOrders._id",
                            orderId: "$availOrders.orderId",
                            myCheck: "$check.hours",
                            estimatedTime: "$availOrders.timeAlloted",
                            extimatedPrice: "$availOrders.priceOfOrder",
                            pickUpAddress: "$availOrders.pickUpAddress",
                            dropAddress: "$availOrders.dropAddress",
                        }
                    }
                ]).sort({
                    availOrders: 0
                });


                res.status(201).json({
                    success: true,
                    Notifications
                })

            } catch (error) {
                console.log("Error in getDriverNotifications and error is : ", error)
                return res.status(504).json({
                    message: 'Could Not get Drivers Notifications',
                    success: false
                })
            }
        }
    }
}
 
// get newly Got Order Request from Customer
const getNewlyGotOrderReqs = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Driver Id is Required'
        })
    } else {
        let isExist = await Drivers.findById(id);
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect'
            })
        } else {
            try {
                let newNotification = await Drivers.aggregate([{
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                        },
                    },
                    {
                        $lookup: {
                            from: 'oturqapporders',
                            localField: 'gotResponseFromCust',
                            foreignField: '_id',
                            as: 'gotResponseFromCust'
                        },
                    },
                    {
                        $unwind: "$gotResponseFromCust"
                    },
                    {
                        $project: {
                            _id: "$_id",
                            OrderId: "$gotResponseFromCust._id",
                            Extimated_Time: "$gotResponseFromCust.timeAlloted",
                            Price: "$gotResponseFromCust.priceOfOrder",
                            pickUpAddress: "$gotResponseFromCust.pickUpAddress",
                            dropAddress: "$gotResponseFromCust.dropAddress",
                        }
                    }
                ]).sort({
                    gotResponseFromCust: 0
                });


                res.status(201).json({
                    success: true,
                    newNotification,
                    message: "This Order has Approved Your Request, Now are you ready for this Shipment?"
                })

            } catch (error) {
                console.log("Error in getNewlyGotOrderReqs and error is : ", error)
                return res.status(504).json({
                    message: 'Could Not get Drivers New Notification',
                    success: false
                })
            }
        }
    }
}

// Stripe Payments
const makeStripePayment = async (req, res) => {
    const {
        id,
        duration,
        cardNumber,
        expMM,
        expYY,
        cvv,
        email,
        name
    } = req.body;

    const createdUser = await stripe.customers.create({
        email: email || 'testUser@gmail.com',
        name: name || "123"
    })

    //console.log("createdUser", createdUser)
    if (createdUser) {
        try {
            const token = await stripe.tokens.create({
                card: {
                    number: cardNumber,
                    exp_month: expMM,
                    exp_year: expYY,
                    cvc: cvv
                }
            })
            //console.log("token : ", token)
            const AddingCardToUser = await stripe.customers.createSource(createdUser.id, {
                source: token.id
            })
            //console.log("AddingCardToUser : ", AddingCardToUser)

            let playListPrice = await PlayLists.findById(id, {
                price: 1,
                _id: 0
            });
            let totAmount = 0;
            let cuntDate = new Date();
            let endDate = new Date();
            if (duration === "Monthly") {
                totAmount = playListPrice.price * 30;
                endDate.setDate(cuntDate.getDate() + 30);
            }
            if (duration === "Daily") {
                totAmount = playListPrice.price * 1;
                endDate.setDate(cuntDate.getDate() + 1);
            }
            if (duration === "Quarterly") {
                totAmount = playListPrice.price * 120;
                endDate.setDate(cuntDate.getDate() + 120);
            }
            if (duration === "Yearly") {
                totAmount = playListPrice.price * 365;
                endDate.setDate(cuntDate.getDate() + 365);
            }
            const charge = await stripe.charges.create({
                amount: totAmount * 100,
                description: 'Dream App Service Charges',
                currency: 'USD',
                customer: createdUser.id,
                //card: token.id
            })
            //console.log("SuccessFull Charged : ", charge)
            // const invoice = await stripe.invoices.sendInvoice(charge.id);
            // console.log("invoice", invoice)

            // Sending mail to User
            // step 01
            const transport = nodeMailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.myEmail, //own eamil
                    pass: process.env.myPassword, // own password
                }
            })
            // setp 02
            const mailOption = {
                from: process.env.myEmail, // sender/own eamil
                to: email, // reciver/admin eamil
                subject: "!! E-Learning App !! Pyament for Subscription of a PlayList.",
                text: `Dear User. \n E-learning App has Charged Amount of (${totAmount}) from your stripe account for their subscription. \n Thanks.`
            }
            // step 03
            transport.sendMail(mailOption, (err, info) => {
                if (err) {
                    console.log("Error occured : ", err)
                    return res.json({
                        success: false,
                        mesage: "Error in sending mail",
                        err
                    })
                } else {
                    console.log("Email Sent to user SuccessFully : ", info.response)
                }
            })

            // Sending mail to Admin
            // setp 02
            const mailOptionOne = {
                from: process.env.myEmail, // sender/own eamil
                to: process.env.myEmail, // reciver/admin eamil
                subject: "!! E-Learning App !! Pyament Recieved for Subscription of a PlayList.",
                text: `Dear Admin. \n A User has been Charged Amount of (${totAmount}) for his/her subscription. \n Thanks.`
            }
            // step 03
            transport.sendMail(mailOptionOne, (err, info) => {
                if (err) {
                    console.log("Error occured : ", err)
                    return res.json({
                        success: false,
                        mesage: "Error in sending mail",
                        err
                    })
                } else {
                    console.log("Email Sent to Admin SuccessFully : ", info.response)
                }
            })

            // updating user data
            let puchasedPlayListItem = {
                id: id,
                duration: duration,
                endDate: endDate
            }
            let randomNo = (Math.floor(Math.random() * 1000000) + 1000000).toString().substring(1);
            let myOrder = {
                orderId: randomNo,
                total: totAmount,
            }

            await Users.findOneAndUpdate({
                email: email
            }, {
                $push: {
                    puchasedPlayList: puchasedPlayListItem,
                    orders: myOrder
                }
            }, {
                new: true
            })

            return res.status(201).json({
                success: true,
                message: "Payment Charged Successfully and also a mail has been sent to User as well as Admin."
            });
        } catch (error) {
            switch (error.type) {
                case 'StripeCardError':
                    // A declined card error
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    error.message; // => e.g. "Your card's expiration year is invalid."
                    break;
                case 'StripeInvalidRequestError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // Invalid parameters were supplied to Stripe's API
                    break;
                case 'StripeAPIError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // An error occurred internally with Stripe's API
                    break;
                case 'StripeConnectionError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // Some kind of error occurred during the HTTPS communication
                    break;
                case 'StripeAuthenticationError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // You probably used an incorrect API key
                    break;
                case 'StripeRateLimitError':
                    console.log(`Error in ${error.type} and error is : `, error.message)
                    // Too many requests hit the API too quickly
                    break;
            }
            return res.status(501).json({
                success: false,
                message: `Error in ${error.type} and error is :  ${error.message}`
            });
        }
    }
}

// check avail balance
const checkBalance = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required'
        })
    } else {
        const isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Dtriver Id is Incorrect '
            })
        } else {
            try {
                res.status(201).json({
                    success: true,
                    Balance: isExist.availCash
                })

            } catch (error) {
                console.log("Error in checkBalance and error is : ", error)
                return res.status(504).json({
                    success: false
                })
            }
        }
    }
}

// Withdraw amount
const widthDrawAmt = async (req, res) => {
    const {id} = req.params;
    const {amount} = req.body
    let amtToDeduce = Number(amount);
    if (!id || !amount) {
        return res.status(500).json({success: false, message: 'Payment and Id of Driver are Required for Making Payment Request'})
    }else{
        let isExistDriver = await Drivers.findById(id)
        if(!isExistDriver){
            return res.status(404).json({success: false, message: 'Driver Id is Incorrect'})
        }else {
            try {
                if (amtToDeduce > isExistDriver.availCash) {
                    return res.status(404).json({success: false, message: 'Entered Amount is greater than available amount'})
                }else {
                    var curntDate = new Date();
                    var withdrawlDated = isExistDriver.widthDrawlDate;
                    if (withdrawlDated === null) {
                        let finalAMT = Number(isExistDriver.availCash) - amtToDeduce
                        isExistDriver.availCash = finalAMT;
                        isExistDriver.widthDrawlDate = curntDate;
                        let updatedDriver = await Drivers.findByIdAndUpdate(id ,{ $set: { ...isExistDriver } } , {new: true} )
                        return res.status(201).json({success : true , message: 'Payment Deducted SuccessFully'})
                    }
                    var diff = new Date(curntDate.getTime() - withdrawlDated.getTime());
                    if ((diff.getUTCDate() - 1) > 7) { // get diff between dates in days i.e driver will only able to withdraw amoint m if diff is greater than 7 days
                        let finalAMT = Number(isExistDriver.availCash) - amtToDeduce
                        isExistDriver.availCash = finalAMT;
                        isExistDriver.widthDrawlDate = curntDate;
                        let updatedDriver = await Drivers.findByIdAndUpdate(id ,{ $set: { ...isExistDriver } } , {new: true} )

                        res.status(201).json({success: true , message: 'Payment Deducted SuccessFully'})
                    }else {
                        return res.status(404).json({success: false , message: `Your are not able to widthdraw amount as your previous widthdrawl date is ${isExistDriver.widthDrawlDate}. After 7 days of previous withdrwal you will be able to withdraw amount agian. Thanks.`})
                    }
                }
            } catch (error) {
                console.log("Error in widthDrawAmt and error is : ", error)
                return res.status(500).json({success: false})
            }
        }
    }
}


// get all drivers  Count
const getAllDriversCount = async (req, res) => {
    try {
        const count = await Drivers.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Driver Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllDriversCount and error is : ", error)
        return res.json({
            success: false,
            message: "Could not get All Driver Count"
        });
    }
}

// get all drivers
const getAllDrivers = async (req, res) => {
    try {
        const allDrivers = await Drivers.find({} , {createdAt : 0, updatedAt : 0 , __v :0 });
        if (!allDrivers) {
            return res.json({
                success: false,
                message: 'No Driver Found',
            });
        } else {
            return res.json({
                AllDrivers:allDrivers ,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllDrivers and error is : ", error)
        return res.json({
            success: false,
            message: "Could not get All Driver Count"
        });
    }
}


// uodate Driver active status
const updateDriverStatus = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required for Updation'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Driver Id is Incorrect '
            })
        } else {
            try {
                if (isExist.activeStatus == true){
                    isExist.activeStatus = false
                }else{
                    isExist.activeStatus = true
                }

                await Drivers.findByIdAndUpdate(id, {
                    $set: isExist
                }, {
                    new: true
                })
                res.status(201).json({
                    success: true,
                })

            } catch (error) {
                console.log("Error in updateDriverStatus and error is : ", error)
                return res.status(504).json({
                    message: 'Some Server Side Error Occured',
                    success: false
                })
            }
        }
    }
}

module.exports = {
    signInDriver,
    LogInUser,
    updateUserStatus,
    addDriverDocs,
    addDriverDetails,
    addNewVehicle,
    updateDriverLocation,
    getDriverNotifications,
    getNewlyGotOrderReqs,
    updateDriverCarDetails,
    addDriverPaymentDetails,
    getDriverPersonelDetails,
    getDriverVehiclesDetails,
    getDriverSingleVehicleDetails,
    updateDriverProfile,
    updateDriverSingleVehicleDetails,
    getDriverDocs,
    updateDriverDetails,
    getDriverPaymentDetails,
    getDriverProfile,
    checkBalance,
    widthDrawAmt,
    updateDriverProfilePicOnly,
    getAllDriversCount,
    getAllDrivers,
    updateDriverStatus,
    SignInUserAdmin,
}