const Customers = require('../models/CustomerSchema')
const Drivers = require('../models/DriverSchema')
const Orders = require('../models/OrderSchema')
const Vehicles = require('../models/VehicleSchema')
const Admins = require('../models/AdminSchema')
const mongoose = require("mongoose")
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const stripe = require('stripe')(process.env.Stripe_Secret_key)
const nodeMailer = require("nodemailer");
const ThawaniClient = require('thawani-node')
const URL = "http://localhost:8080"
const api = new ThawaniClient({
    secretKey: "rRQ26GcsZzoEhbrP2HZvLYDbn9C9et",
    publishableKey: "HGvTMLDssJghr9tlN9gr4DVYt0qyBy",
    dev: true, // false to set it for production
});

// adding new order
const addNewOrder = async (req, res) => {
    const {
        postedBy,
        vehicleType,
        pickUpLoc,
        dropLoc,
        pickUpAddress,
        dropAddress,
        priceOfOrder,
        timeAlloted,
        senderPhoneNo,
        recieverPhoneNo,
        customerNotes
    } = req.body;

    if (!postedBy || !vehicleType || !pickUpLoc || !dropLoc || !pickUpAddress || !dropAddress || !priceOfOrder || !timeAlloted  ) {
        return res.json({message : "Please fill All required credentials"});
    }else{
        // checking if any order already pending
        const checkOrder = await Orders.findOne({ postedBy : postedBy , status : false });
        if (checkOrder){
            return res.status(201).json({
                success: false,
                message: 'You Can Not Post Any other Order , As One Your Order is Being under process. Thanks'
            })
        }

        const newOrder = new Orders({ ...req.body })
        try {
            const addedOrder = await newOrder.save();
            const id = addedOrder._id.toString();

            // sending request to online drivers in 10 km radius
            let check = await sendDriverNotifications(pickUpLoc[0], pickUpLoc[1], vehicleType , id)

            if (check !== "Done") {
                return res.status(504).json({
                    success: true,
                    message: 'Order Has Been Posted , But no Driver Found in Your Destination'
                })
            }

            return res.status(201).json({success: true, OrderId : id ,  message: 'Order Placed SuccessFully, Please wait for Drivers Response.Thanks' })

        }catch (error) {
            console.log("Error in addNewOrder and error is : ", error)
        }
    }
}

// adding new order
const addOrderImages = async (req, res) => {
    const {id} = req.params;

    // checking if sent files are of image type or not
    if (!req.files && !req.file) {
        for (let i = 0; i != req.files.length; i++) {
            if ((req.files[i].mimetype !== "image/jpeg" && req.files[i].mimetype !== "image/jpg" && req.files[i].mimetype !== "image/webP" && req.files[i].mimetype !== "image/png")) {
                return res.json({
                    success: false,
                    message: "No Order Images Found"
                });
            }
        }
    }
    // checking if sent files are of image type or not
    if (req.files) {
        for (let i = 0; i != req.files.length; i++){
            if ((req.files[i].mimetype !== "image/jpeg" && req.files[i].mimetype !== "image/jpg" && req.files[i].mimetype !== "image/webP" && req.files[i].mimetype !== "image/png")) {
                return res.json({
                    success: false,
                    message: "Order Image Not Found"
                });
            }
        }
    }

    // checking if sent file are of image type or not
    if (req.file) {
        if ((req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/jpg" && req.file.mimetype !== "image/webP" && req.file.mimetype !== "image/png")) {
            return res.json({
                success: false,
                message: "Order Image Not Found"
            });
        }
    }

        // checking if any order already pending
        const checkOrder = await Orders.findById(id);
        if (!checkOrder){
            return res.status(201).json({
                success: false,
                message: 'Order Not Found'
            })
        }

        let orderImages = []
        if(req.files){
            for (let i = 0; i !== req.files.length; i++) {
                var lower = req.files[i].filename.toLowerCase();
                let newLower = URL + "/ordersPics/" + lower
                orderImages.push(newLower);
            }
        }else if (req.file){
                var lower = req.file.filename.toLowerCase();
                let newLower = URL + "/ordersPics/" + lower
                orderImages.push(newLower);
        }
        try {
            const updateOrder = await Orders.findByIdAndUpdate(id , {$set : {images : orderImages} } , {new : true})

            return res.status(201).json({success: true,  message: 'Order Images Added SuccessFully' })

        }catch (error) {
            console.log("Error in addNewOrder and error is : ", error)
            return res.status(201).json({
                success: false,
                message: 'Order Images Could Not be Added'
            })
        }
}

// get all active cutomers in loc bewteen
const sendDriverNotifications = async (lat1, long1, myVehicleType , id) => {
    var distance;
    try {
        //getting active drivers first
        const allDrivers = await Drivers.find({activeStatus : true}); // getting only online drivers
        let AllDrivers = [];
        // checking which active driver has vehicle same as mercehent wants
        for (let u = 0; u !== allDrivers.length; u++){
            let driver = await Vehicles.findOne({owner : allDrivers[u]._id , vehicleType : myVehicleType});
            if (driver){
                const singleDri = await Drivers.findById(allDrivers[u]._id); // getting only online drivers
                AllDrivers.push(singleDri)
            }
        }
        // sending request to finalized drivers
        if (AllDrivers.length > 0){
            for (var i = 0; i !== AllDrivers.length; i++) {
                distance = await calcCrow(lat1, long1, AllDrivers[i].curntLoc[0], AllDrivers[i].curntLoc[1]);
                if(distance < 10){ // puts drivers which are less than 10 km in array
                    await Drivers.findByIdAndUpdate(AllDrivers[i]._id ,{ $push : {availOrders : id }  }  , {new: true} )
                    await Orders.findByIdAndUpdate(id ,{ $push : {availDrivers : AllDrivers[i]._id }  }  , {new: true} )
                }
                console.log("distance : ", distance)
            }
            return "Done";
        }else{
            return "Sorry , No Driver Found In Your Region"
        }
  }catch (e) {
    console.log("Errr  is : ", e.message);
    return "Not Done"
  }
}

// adding driver responses
const addDriversReponses = async (req,res) => {
    const {id} = req.params;
    const {price, estTime , orderId} = req.body;

    // checking if user has sent any data for updating or not
    if ((Object.keys(req.body).length === 0)) {
        return res.status(201).json({
            success: false,
            message: 'You have not sent any Data'
        })
    }

    if (!price || !estTime || !orderId || !id) {
        return res.status(201).json({
            success: false,
            message: 'Please fill all Required Credientials'
        })
    }else{
        try {
            let gotOrder = await Orders.findById(orderId);
            if (!gotOrder){
                return res.status(201).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }else{
                if(gotOrder.status === true){
                    return res.status(201).json({
                        success: true,
                        message: 'Sorry, Could Not Send Request as Order has been Started by Some on Else'
                    })
                }
                let respondedDrivers = {};
                respondedDrivers.id = id;
                respondedDrivers.estTime = estTime;
                respondedDrivers.price = price;

                gotOrder.respondedDrivers.push(respondedDrivers)

                await Orders.findByIdAndUpdate(orderId ,{ $set : gotOrder }  , {new: true} )

                return res.status(201).json({
                    success: true,
                    message: 'Request Sent To Merchent SuccessFully'
                })
            }
        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: true,
                message: 'Could Not Send Request to Customer'
            })
        }
    }

}

// getting driver responses
const getDriversReponses = async (req,res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    }else{
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: 'oturqappdrivers',
                        localField: 'respondedDrivers.id',
                        foreignField: '_id',
                        as: 'respondedDriver'
                    },
                },
                {$unwind: "$respondedDriver"},
                    {
                        $project: {
                            _id: "$respondedDriver._id",
                            name: "$respondedDriver.name",
                            //rating: "$respondedDriver.rating",
                            OfferedPrice  : "$respondedDrivers.price",
                            EstimatedTime: "$respondedDrivers.estTime",
                            picture: "$respondedDriver.profilePic",
                            // extimatedPrice : "$respondedDrivers.priceOfOrder",
                            // pickUpAddress: "$respondedDrivers.pickUpAddress",
                            // dropAddress: "$respondedDrivers.dropAddress",
                        }
                    }
            ]).sort({
                respondedDrivers: 0
            });

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

// accepting Driver's Request
const acceptDriverRequest = async (req,res) => {
    const {id , driverId} = req.params;


    if (!id || !driverId) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            const gotOrder = await Orders.findById(id);
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            let gotDriver = await Drivers.findById(driverId);
            if (!gotDriver){
                return res.status(404).json({
                    success: false,
                    message: 'Driver Not Found'
                })
            }
            gotDriver.gotResponseFromCust.push(id)

            await Drivers.findByIdAndUpdate(driverId ,{ $set : gotDriver }  , {new: true} )



            return res.status(201).json({
                success: true,
                message : "Response Sent to Driver SuccessFully"
            })

        }catch (e) {
            console.log("Errr in acceptDriverRequest and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

//  Driver accepting order
const orderAcceptByDriver = async (req,res) => {
    const {id , driverId} = req.params;


    if (!id || !driverId) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            const gotOrder = await Orders.findById(id);
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            let gotDriver = await Drivers.findById(driverId);
            if (!gotDriver){
                return res.status(404).json({
                    success: false,
                    message: 'Driver Not Found'
                })
            }
            if(gotOrder.status === true){
                return res.status(201).json({
                    success: false,
                    message: 'Order has Already Been Started'
                })
            }
            gotOrder.status = true;
            gotOrder.recieverId = driverId;
            gotOrder.orderStatus = "Arriving";
            await Orders.findByIdAndUpdate(id ,{ $set : gotOrder }  , {new: true} )

            gotDriver.pendingOrders.push(id)
            gotDriver.ordersRecieved += 1;
            await Drivers.findByIdAndUpdate(driverId ,{ $set : gotDriver }  , {new: true} )

            // pulling our order from avail drivers notifications
            for (let i = 0; i !== gotOrder.availDrivers.length; i++){
                //console.log("gotOrder.availDrivers[i] : ", gotOrder.availDrivers[i])
                await Drivers.findByIdAndUpdate(gotOrder.availDrivers[i] ,{ $pull : {availOrders : id }  }  , {new: true} )
            }


            return res.status(201).json({
                success: true,
                message : "Order has Been Started"
            })

        }catch (e) {
            console.log("Errr in orderAcceptByDriver and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

//  order collected by driver
const orderCollctedByDriver = async (req,res) => {
    const {id , recievedBy} = req.params;

    if (!id || !recievedBy) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            let gotDriver = await Drivers.findById(recievedBy);
            if (!gotDriver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver Not Found'
                })
            }

            let gotOrder = await Orders.findOne({_id : id , recievedBy : recievedBy});
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            if (gotOrder.orderStatus === 'Collected') {
                return res.status(201).json({
                    success: false,
                    message: 'Order has been already Collected'
                })
            }

            gotOrder.orderStatus = "Collected";


            await Orders.findByIdAndUpdate(id ,{ $set : gotOrder }  , {new: true} )

            return res.status(201).json({
                success: true,
                message : "Order Has Been Collected By Driver"
            })

        }catch (e) {
            console.log("Errr in deleteSingeleOrder and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not Delete Order'
            })
        }
    }

}

//  Change order status time by time
const changeOrderStatus = async (req,res) => {
    const {id , driverId} = req.params;
    const {orderStatus} = req.body;

    if (!id || !driverId || !orderStatus) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            let gotDriver = await Drivers.findById(driverId);
            if (!gotDriver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver Not Found'
                })
            }

            const gotOrder = await Orders.findOne({_id : id , recieverId : driverId});
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            if(gotOrder.status === false){
                return res.status(201).json({
                    success: false,
                    message: 'Order has Not Started Yet'
                })
            }

            gotOrder.orderStatus = orderStatus;
            await Orders.findByIdAndUpdate(id ,{ $set : gotOrder }  , {new: true} )

            return res.status(201).json({
                success: true,
                message : "Order Status Changed"
            })

        }catch (e) {
            console.log("Errr in changeOrderStatus and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not Update Status'
            })
        }
    }

}

// Order Completed By driver
const orderCompletedByDriver = async (req,res) => {
    const {id , driverId} = req.params;

     // checking if sent files are of image type or not
     if (!req.file) {
        return res.json({
            success: false,
            message: "Reaching Reciept is necessary for order completion"
        });
     }

    // checking if sent files are of image type or not
    if (req.file) {
        if ((req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/jpg" && req.file.mimetype !== "image/webP" && req.file.mimetype !== "image/png")) {
            return res.json({
                success: false,
                message: "Image Not Found"
            });
        }
    }


    if (!id || !driverId || !req.file) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            let gotDriver = await Drivers.findById(driverId);
            if (!gotDriver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver Not Found'
                })
            }

            const gotOrder = await Orders.findOne({_id : id , recieverId : driverId});
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            if (gotOrder.orderStatus == "Completed"){
                return res.status(404).json({
                    success: false,
                    message: 'order has already been completed'
                })
            }

            if(gotOrder.status === false){
                return res.status(201).json({
                    success: false,
                    message: 'Order has Not Started Yet'
                })
            }

            if (req.file) {
                var lower = req.file.filename.toLowerCase();
                gotOrder.orderRecieptPic = URL + "/ordersPics/" + lower;
            }
            gotOrder.confrimOrderReachedByDriver = true;
            gotOrder.orderStatus = "Completed";
            await Orders.findByIdAndUpdate(id ,{ $set : gotOrder }  , {new: true} )

            // pushing into driver's completed orders array
            await Drivers.findByIdAndUpdate(driverId ,{ $pull : {pendingOrders : id } , $push : {completedOrders : id} }  , {new: true} )

            return res.status(201).json({
                success: true,
                message : "Order has been Reached SuccessFully"
            })

        }catch (e) {
            console.log("Errr in orderCompletedByDriver and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not Update Status'
            })
        }
    }

}

// getting all orders of a customer
const getAllOrdersOfCustomer = async (req,res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    }else{
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        postedBy: mongoose.Types.ObjectId(id),
                    },
                },
                {
                    $project: {
                        id : "$_id",
                        orderId: "$orderId",
                        orderStatus: "$orderStatus",
                        timeAlloted: "$timeAlloted",
                        priceOfOrder: "$priceOfOrder",
                        pickUpAddress: "$pickUpAddress",
                        dropAddress: "$dropAddress",
                        _id : 0
                    }
                }
            ]).sort({
                createdAt: 0
            });

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

// getting Single order of a customer
const getSingleOrderOfCustomer = async (req,res) => {
    const {id , postedBy } = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    }else{
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        postedBy: mongoose.Types.ObjectId(postedBy),
                        _id: mongoose.Types.ObjectId(id)
                    },
                },
                {
                    $lookup: {
                        from: 'oturqappdrivers',
                        localField: 'recieverId',
                        foreignField: '_id',
                        as: 'recieverId'
                    },
                }, {
                    $unwind: "$recieverId"
                },
                {
                    $project: {
                        id : "$_id",
                        DriverName: "$recieverId.name",
                        ratingOfDriver: "$recieverId.rating",
                        DriverPhoto: "$recieverId.profilePic",
                        timeAlloted: "$timeAlloted",
                        vehicleType: "$vehicleType",
                        priceOfOrder: "$priceOfOrder",
                        pickUpAddress: "$pickUpAddress",
                        dropAddress: "$dropAddress",
                        customerNotes: "$customerNotes",
                        orderStatus: "$orderStatus",
                        _id : 0
                    }
                }
            ]).sort({
                createdAt: 0
            });

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

// getting Single order for Admin
const getSingleOrderOfAdmin = async (req,res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    }else{
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    },
                },
                {
                    $lookup: {
                        from: 'oturqappdrivers',
                        localField: 'recieverId',
                        foreignField: '_id',
                        as: 'recieverId'
                    },
                }, {
                    $unwind: "$recieverId"
                },
                {
                    $project: {
                        id : "$_id",
                        DriverName: "$recieverId.name",
                        OrderId: "$orderId",
                        ratingOfDriver: "$recieverId.rating",
                        DriverPhoto: "$recieverId.profilePic",
                        timeAlloted: "$timeAlloted",
                        vehicleType: "$vehicleType",
                        priceOfOrder: "$priceOfOrder",
                        pickUpAddress: "$pickUpAddress",
                        dropAddress: "$dropAddress",
                        customerNotes: "$customerNotes",
                        orderStatus: "$orderStatus",
                        _id : 0
                    }
                }
            ]).sort({
                createdAt: 0
            });

            return res.status(201).json({
                success: true,
                SingleOrder : responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

// getting Single order for driver
const getSingleOrderforDriver = async (req, res) => {
    const {
        id,
    } = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    } else {
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    },
                },
                {
                    $project: {
                        id: "$_id",
                        timeAlloted: "$timeAlloted",
                        vehicleType: "$vehicleType",
                        priceOfOrder: "$priceOfOrder",
                        pickUpAddress: "$pickUpAddress",
                        dropAddress: "$dropAddress",
                        customerNotes: "$customerNotes",
                        orderStatus: "$orderStatus",
                        _id: 0
                    }
                }
            ]).sort({
                createdAt: 0
            });

            return res.status(201).json({
                success: true,
                responses,
            })

        } catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

//  delete any order by customer
const deleteSingeleOrder = async (req,res) => {
    const {id , postedBy} = req.params;

    if (!id || !postedBy) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            let gotCustomer = await Customers.findById(postedBy);
            if (!gotCustomer) {
                return res.status(404).json({
                    success: false,
                    message: 'Merchent Not Found'
                })
            }

            const gotOrder = await Orders.findOne({_id : id , postedBy : postedBy});
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            if (gotOrder.orderStatus !== 'Created' && gotOrder.orderStatus !== 'Completed') {
                return res.status(201).json({
                    success: false,
                    message: 'Order has been Started and Now can not be Deleted Untill It Reaches its Destination.'
                })
            }

            await Orders.findByIdAndDelete(id)

            return res.status(201).json({
                success: true,
                message : "Order Deleted SuccessFully"
            })

        }catch (e) {
            console.log("Errr in deleteSingeleOrder and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not Delete Order'
            })
        }
    }

}

//  cancelling any order by Driver
const deleteSingeleOrderByDriver = async (req,res) => {
    const {id , recievedBy} = req.params;
    const {msg} = req.body;

    if (!id || !recievedBy) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            let gotDriver = await Drivers.findById(recievedBy);
            if (!gotDriver) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver Not Found'
                })
            }

            const gotOrder = await Orders.findOne({_id : id , recievedBy : recievedBy});
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            if (gotOrder.orderStatus === 'Arriving') {
                gotOrder.orderStatus = "Cancelled By Driver";
                gotOrder.ordercancelledByDriver = true;
                gotOrder.orderCancelReason = msg;
                // updataing order
                await Orders.findByIdAndUpdate(id ,{ $set : gotOrder }  , {new: true} )

                // adding rejected order count to driver model
                gotDriver.ordersRejected += 1;
                await Drivers.findByIdAndUpdate(recievedBy ,{ $set : gotDriver }  , {new: true} )
                return res.status(201).json({
                    success: true,
                    message : "Order Cancelled SuccessFully"
                })
            }

            return res.status(201).json({
                success: false,
                message: 'Order has been Started and Now can not be Deleted Untill It Reaches its Destination.'
            })

        }catch (e) {
            console.log("Errr in deleteSingeleOrder and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not Delete Order'
            })
        }
    }

}

//  delete any order by merchent
const cancelOrderByMerchent = async (req,res) => {
    const {id , postedBy} = req.params;
    const {msg} = req.body;

    if (!id || !postedBy) {
        return res.status(403).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }else{
        try {
            let gotCust = await Customers.findById(postedBy);
            if (!gotCust) {
                return res.status(404).json({
                    success: false,
                    message: 'Merchent Not Found'
                })
            }

            const gotOrder = await Orders.findOne({_id : id , postedBy : postedBy});
            if (!gotOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Order Not Found'
                })
            }

            if (gotOrder.orderStatus === 'Arriving') {
                gotOrder.orderStatus = "Cancelled By Merchent";
                gotOrder.ordercancelledByCustomer = true;
                gotOrder.orderCancelReason = msg;

                await Orders.findByIdAndUpdate(id ,{ $set : gotOrder }  , {new: true} )
                return res.status(201).json({
                    success: true,
                    message : "Order Cancelled SuccessFully"
                })
            }

            return res.status(201).json({
                success: false,
                message: 'Order has been Started and Now can not be Deleted Untill It Reaches its Destination.'
            })

        }catch (e) {
            console.log("Errr in deleteSingeleOrder and error  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not Delete Order'
            })
        }
    }

}

// getting all Pending orders of a deriver
const getAllPendingOrdersOfDriver = async (req,res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    }else{
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        recieverId: mongoose.Types.ObjectId(id),
                        $or : [ {orderStatus : "Pending"} , {orderStatus : "Collected"}]
                    },
                },
                {
                    $project: {
                        id : "$_id",
                        orderId: "$orderId",
                        orderStatus: "$orderStatus",
                        timeAlloted: "$timeAlloted",
                        priceOfOrder: "$priceOfOrder",
                        pickUpAddress: "$pickUpAddress",
                        dropAddress: "$dropAddress",
                        _id : 0
                    }
                }
            ]).sort({
                createdAt: 0
            });

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}

// getting all completes orders of a deriver
const getAllCompletedOrdersOfDriver = async (req,res) => {
    const {id} = req.params;

    if (!id) {
        return res.status(201).json({
            success: false,
            message: 'Order Id Not Found'
        })
    }else{
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        recieverId: mongoose.Types.ObjectId(id),
                        orderStatus : "Completed"
                    },
                },
                {
                    $project: {
                        id : "$_id",
                        orderId: "$orderId",
                        orderStatus: "$orderStatus",
                        timeAlloted: "$timeAlloted",
                        priceOfOrder: "$priceOfOrder",
                        pickUpAddress: "$pickUpAddress",
                        dropAddress: "$dropAddress",
                        _id : 0
                    }
                }
            ]).sort({
                createdAt: 0
            });

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }
    }

}


// Stripe Payments
const makeStripePayment = async (req,res) => {
    const { id, cardNumber, expMM, expYY, cvv , email , name} = req.body;
    //console.log("In Stripe : ", id, cardNumber, expMM, expYY, cvv , email , name )

    let gotOrder = await Orders.findById(id);
    if (!gotOrder) {
        return res.json({message: 'Order Does Not Exists'});
    }

    const createdUser = await stripe.customers.create({
        email: email || 'testUser@gmail.com',
        name: name || "123"
    })

    //console.log("createdUser", createdUser)
    if (createdUser)
    {
        try {
            const token = await stripe.tokens.create({ card: {
                number: cardNumber, exp_month: expMM, exp_year: expYY, cvc: cvv } })
           //console.log("token : ", token)
            const AddingCardToUser = await stripe.customers.createSource(createdUser.id, { source: token.id })
            //console.log("AddingCardToUser : ", AddingCardToUser)
            let amtCharged = Math.round(gotOrder.priceOfOrder);
            //console.log("gotOrder.finalAm", gotOrder.finalAmt  , "New Amount : ", amtCharged)
           const charge = await stripe.charges.create({
                amount: amtCharged * 100,
                description: 'Tracakza Trading Services Order Charges',
                currency: 'USD',
                customer: createdUser.id,
                //card: token.id
            })
            //console.log("SuccessFull Charged : ", charge)
            // const invoice = await stripe.invoices.sendInvoice(charge.id);
            // console.log("invoice", invoice)
            let driver = await Drivers.findById(gotOrder.recieverId);
            let drieverAmount = ( priceOfOrder - 25 ) * 100;
            let adminAmt = priceOfOrder - drieverAmount;
            driver.availCash = drieverAmount;
            await Drivers.findByIdAndUpdate(gotOrder.recieverId ,{ $set:  { ...driver} } , {new: true} )

            gotOrder.paymentStatus = true;
            gotOrder.driverGotAmt = drieverAmount;
            gotOrder.adminAmt = adminAmt;
            await Orders.findByIdAndUpdate(id ,{ $set:  { ...gotOrder} } , {new: true} )
            console.log("going to return")
            return res.json({success: true , message : "Payment Charged Successfully"});
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
            return `Error in ${error.type} and error is :  ${error.message}`
        }
    }
}

// Thawani Payments
const makeThawaniPayments = async (req,res) => {
    const {id} = req.params;
    if(!id){
        return res.status(404).json({
            success: false,
            message: 'Id of Order is Reqiured'
        })
    }else{
        let checkOrder = await Orders.findOne({orderId : id})
        if(!checkOrder){
            return res.status(404).json({
                success: false,
                message: 'Id of Order is In Correct'
            })
        }

        const merchent = await Customers.findById(checkOrder.postedBy)
        console.log("email : ", merchent.firstname)
            try{
                // creating customer
                let customer_token = null;
                const response = await api.customer.create(merchent.firstname); 
                customer_token = response.data.id;
                //console.log("customer_token : ", customer_token)
            
                // creating session
                let new_session = null;
                const payload = {
                    client_reference_id: "2021293168",
                    products: [{
                            name: "Service Charges for Oturq Trading App",
                            unit_amount: checkOrder.priceOfOrder,
                            quantity: 1,
                        },
                    ],
                    success_url: "https://www.linkedin.com/company/mexatechub/?originalSubdomain=pk",
                    cancel_url: "http://mtechub.com/",
                    metadata: {
                        customer: merchent.firstname,
                        order_id: 10,
                    },
                };
                const sess = await api.session.create(payload);
                new_session = sess.data.session_id;
                //console.log("new_session Id : ", new_session)
            
                // getting session token
                const sessionToken = await api.session.findSessionByID(new_session);
                //console.log("sessionToken : ", sessionToken)
            
                // redirecting to payment gateway
                const expected_redirect = api.redirect(new_session);
                const toBe_redirect =
                    process.env.Thawani_NODE_API_DEV_URI +
                    "/pay/" +
                    new_session +
                    "?key=" +
                    process.env.PUBLISH;
            
                console.log("expected_redirect : ", expected_redirect)
                console.log("toBe_redirect : ", toBe_redirect)
            
            
                // gtting all sessions
                const allSessions = await api.session.findAll();
                //console.log("allSessions : ", allSessions)
        
                res.status(200).json({
                    success: true,
                    ReDirectLink: expected_redirect,
                    message : "Please Click on This Link to Make Payments."
                })
        
            }catch(e) {
                res.status(200).json({
                    success: false,
                    message: "Some Thawani  Error"
                })
            }

    }
}

// calculate and add final amounts to driver and admin
const calacFinalAmt = async (req,res) => {
    const {id} = req.params
    try {
        let gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.status(500).json({
                success: false,
                message: 'Order Does Not Exists'
            })
        }else{
            if ((gotOrder.ordercancelledByDriver === true) || (gotOrder.ordercancelledByCustomer === true)) {
                    return res.status(500).json({
                        success: false,
                        message: 'Order Amount for Amdin and Driver Can Not Be Calculated as Order Has Been Cancelled Before It Started.'
                    })
                }else{
                    // checking if order is completed or not
                    if (gotOrder.orderStatus !== "Completed") {
                        return res.status(500).json({
                            success: false,
                            message: 'Payments Can Not be Made before Order gets Completed'
                        })
                    }

                    // checking if payment has been already made or not
                    if ((gotOrder.driverGotAmt !== 0) && (gotOrder.adminAmt !== 0)){
                        return res.status(500).json({
                            success: false,
                            message: 'Admin and Driver Amount have Already been Made.'
                        })
                    }

                    let gotDriver = await Drivers.findById(gotOrder.recieverId)
                    let drievrAmt = ( (gotOrder.priceOfOrder * 75) / 100 ) ;
                    let adminAmt = gotOrder.priceOfOrder - drievrAmt;

                    // calculating driver amount
                    gotOrder.driverGotAmt = drievrAmt;
                    gotOrder.adminAmt = adminAmt;
                    //updating order
                    await Orders.findByIdAndUpdate(id ,{ $set: {...gotOrder } } , {new: true} )

                    // adding amount to driver account
                    gotDriver.ordersDelivered += 1;
                    gotDriver.sales += 1;
                    gotDriver.availCash += Number(drievrAmt);
                    await Drivers.findByIdAndUpdate(gotOrder.recieverId ,{ $set: {...gotDriver } } , {new: true} )

                    // updating admin
                    let admin = await Admins.findOne({email : process.env.My_Admin})
                    admin.availCash += Number(adminAmt)
                    await Admins.findOneAndUpdate({email : process.env.My_Admin} ,{ $set: {...admin} } , {new: true} )
    
                    return res.status(200).json({
                        success: true,
                        message : "Payments Added to Amdin and Diver Account SuccessFully"
                    })
                }
            }
    } catch (error) {
        console.log("Error in calacFinalAmt and error is : ", error)
        return res.status(500).json({
            success: false,
        })
    }
}

// adding tip to driver
const addTipAmount = async (req,res) => {
    const {id} = req.params
    const {tipAmt} = req.body;
    if (!tipAmt || !id){
        return res.status(500).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }
    try {
        let gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.status(500).json({
                success: false,
                message: 'Order Does Not Exists'
            })
        }else{
            if ((gotOrder.ordercancelledByDriver === true) || (gotOrder.ordercancelledByCustomer === true)) {
                    return res.status(500).json({
                        success: false,
                        message: 'Tip Can Not be Added as Order Has Been Cancelled Before It Started.'
                    })
                }else{
                    // checking if order is completed or not
                    if (gotOrder.orderStatus !== "Completed") {
                        return res.status(500).json({
                            success: false,
                            message: 'Tip Can Not be Added before Order gets Completed'
                        })
                    }

                    // checking if payment has been already made or not
                    if (gotOrder.tipAmt !== 0) {
                        return res.status(500).json({
                            success: false,
                            message: 'You have Already Given Tip for this Order, Now No More Tip Can be Added'
                        })
                    }

                    let gotDriver = await Drivers.findById(gotOrder.recieverId)
                    gotDriver.availCash += Number(tipAmt);
                    // adding tip amount
                    await Drivers.findByIdAndUpdate(gotOrder.recieverId ,{ $set: {...gotDriver } } , {new: true} )

                    //updating order
                    gotOrder.tipAmt = tipAmt;
                    await Orders.findByIdAndUpdate(id ,{ $set: {...gotOrder } } , {new: true} )

                    return res.status(200).json({
                        success: true,
                        message: "Tip Added to Diver Account SuccessFully"
                    })
                }
            }
    } catch (error) {
        console.log("Error in addTipAmount and error is : ", error)
        return res.status(500).json({
            success: false,
        })
    }
}

// adding review to order
const reviewOfOrder = async (req,res) => {
    const {id , postedBy} = req.params
    const {rating} = req.body;
    if (!rating || !id){
        return res.status(500).json({
            success: false,
            message: 'Please Provide All Required Credientials'
        })
    }
    try {
        let gotOrder = await Orders.findOne({_id : id ,postedBy : postedBy });
        if (!gotOrder) {
            return res.status(500).json({
                success: false,
                message: 'Order Does Not Exists'
            })
        }else{
            if ((gotOrder.ordercancelledByDriver === true) || (gotOrder.ordercancelledByCustomer === true)) {
                    return res.status(500).json({
                        success: false,
                        message: 'Review Can Not be Added as Order Has Been Cancelled Before It Started.'
                    })
                }else{
                    // checking if order is completed or not
                    if (gotOrder.orderStatus !== "Completed") {
                        return res.status(500).json({
                            success: false,
                            message: 'Review Can Not be Added before Order gets Completed'
                        })
                    }

                    // checking if payment has been already made or not
                    if (gotOrder.reviewOfOrder !== 0) {
                        return res.status(500).json({
                            success: false,
                            message: 'You have Already Given Review for this Order, Now No More Tip Can be Added'
                        })
                    }

                    let gotDriver = await Drivers.findById(gotOrder.recieverId)
                    let length = gotDriver.completedOrders.length;
                    console.log("length : ", length)
                    if (length < 1){
                        gotDriver.rating = 0;
                        gotDriver.rating = rating;
                    }else{
                        gotDriver.rating = 0;
                        gotDriver.rating = ((Number(gotDriver.rating) + Number(rating)) / length);
                        console.log("availReview : ", gotDriver.rating, "rating : ", rating, "length : ", length)
                    }

                    // adding review to driver
                    await Drivers.findByIdAndUpdate(gotOrder.recieverId ,{ $set: {...gotDriver } } , {new: true} )

                    //updating order
                    gotOrder.reviewOfOrder = rating;
                    await Orders.findByIdAndUpdate(id ,{ $set: {...gotOrder } } , {new: true} )

                    return res.status(200).json({
                        success: true,
                        message: "Review Added to Diver Account and Order SuccessFully"
                    })
                }
            }
    } catch (error) {
        console.log("Error in reviewOfOrder and error is : ", error)
        return res.status(500).json({
            success: false,
        })
    }
}

// get all orders  Count
const getAllOrdersCount = async (req, res) => {
    try {
        const count = await Orders.find({}).count();
        if (!count) {
            return res.json({
                success: false,
                message: 'No Orders Found',
            });
        } else {
            return res.json({
                count,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllOrdersCount and error is : ", error)
        return res.json({
            success: false,
            message: "Could not get All Orders Count"
        });
    }
}

// get all Recent orders
const getRecentOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find({} , {createdAt : 0 , updatedAt : 0 , __v : 0 }).limit(4);
        if (!allOrders) {
            return res.json({
                success: false,
                message: 'No Orders Found',
            });
        } else {
            return res.json({
                allOrders,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getRecentOrders and error is : ", error)
        return res.json({
            message : "Could Not Get Recent Orders",
            success: false,
        });
    }
}


// get all All orders for Admin
const getAllOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find({}, {
            createdAt: 0,
            updatedAt: 0,
            __v: 0
        });
        if (!allOrders) {
            return res.json({
                success: false,
                message: 'No Orders Found',
            });
        } else {
            return res.json({
                allOrders,
                success: true,
            });
        }
    } catch (error) {
        console.log("Error in getAllOrders and error is : ", error)
        return res.json({
            message: "Could Not Get Recent Orders",
            success: false,
        });
    }
}

// getting driver responses
const getCancelledOrders = async (req,res) => {
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        $or : [
                            {ordercancelledByCustomer: true,},
                        ]
                    },
                },
                {
                    $lookup: {
                        from: 'oturqappcustomers',
                        localField: 'postedBy',
                        foreignField: '_id',
                        as: 'User'
                    },
                },
                {$unwind: "$User"},
                {
                    $project: {
                            _id : 0,
                            OrderId : "$orderId",
                            CancelBy : "Merchnet",
                            Email : "$User.email",
                            Reason: "$orderCancelReason"
                        }
                },
            ])

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }

}

// getting driver responses
const getCancelledOrdersByDrivers = async (req,res) => {
        try {
            let responses = await Orders.aggregate([{
                    $match: {
                        $or : [
                            {ordercancelledByDriver: true,},
                        ]
                    },
                },
                {
                    $lookup: {
                        from: 'oturqappdrivers',
                        localField: 'recieverId',
                        foreignField: '_id',
                        as: 'User'
                    },
                },
                {$unwind: "$User"},
                {
                    $project: {
                            _id : 0,
                            OrderId : "$orderId",
                            CancelBy : "Driver",
                            Email : "$User.email",
                            Reason: "$orderCancelReason"
                        }
                },
            ])

            return res.status(201).json({
                success: true,
                responses,
            })

        }catch (e) {
            console.log("Errr  is : ", e.message);
            return res.status(201).json({
                success: false,
                message: 'Could Not get Responses'
            })
        }

}

// Sign In user Admin
const sendMail = async (req, res) => {
     const {email , data } = req.body;
    console.log("body : ", req.body)
    if (!email || !data) {
        return res.json({
            success: false,
            message: "Email of User Not Found"
        });
    } else {
        try {
            // step 01
        const transport= nodeMailer.createTransport({
            service : "gmail",
            auth: {
                user : 'oturqapp@gmail.com', //own eamil
                pass: 'oturqapp2001', // own password
            }
        })
        // setp 02
        const mailOption = {
            from: 'oturqapp@gmail.com', // sender/own eamil
            to: email, // reciver eamil
            subject: "Response to your Complaint for Oturq App",
            text : `${data}`
        }
        // step 03
        transport.sendMail(mailOption, (err, info) => {
            if (err) {
                console.log("Error occured : ", err)
                return res.json({success: false, message : "Error in sending mail" , err})
            } else {
                console.log("Email Sent and info is : ", info.response)
                return res.json({success: true, message: 'Email Sent SuccessFully' })
            }
        })

            res.status(201).json({
                success: true,
                //userId : newUser._id,
                message: 'Mail Sent to User SuccessFullyy'
            })
        } catch (error) {
            console.log("Error in sendMail and error is : ", error)
            res.status(201).json({
                success: false,
                message : "Action Could Not Be Performed"
            })
        }
}
}


// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}
// functions finds distance bwteen two lats and langs and returns radius in kms
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(1);
}

module.exports = {
    addNewOrder,
    addDriversReponses,
    getDriversReponses,
    acceptDriverRequest,
    orderAcceptByDriver,
    changeOrderStatus,
    orderCompletedByDriver,
    getAllOrdersOfCustomer,
    getSingleOrderOfCustomer,
    deleteSingeleOrder,
    getSingleOrderforDriver,
    getAllPendingOrdersOfDriver,
    getAllCompletedOrdersOfDriver,
    makeStripePayment,
    orderCollctedByDriver,
    deleteSingeleOrderByDriver,
    cancelOrderByMerchent,
    calacFinalAmt,
    addTipAmount,
    reviewOfOrder,
    makeThawaniPayments,
    addOrderImages,
    getAllOrdersCount,
    getRecentOrders,
    getSingleOrderOfAdmin,
    getAllOrders,
    getAllOrdersCount,
    getCancelledOrders,
    sendMail,
    getCancelledOrdersByDrivers,
}