const express = require('express');
const router = express.Router();
const {
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
    getCancelledOrders,
    sendMail,
    getCancelledOrdersByDrivers
} = require('../controllers/OrderController')
const multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './ordersPics/')
        //cb(null, '../products')
    },
    filename: function (req, file, cb) {
        cb(null, 'order-' + Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
});



// Adding new order
router.post('/api/order/addNew', addNewOrder);

// Adding new order
router.put('/api/order/addOrderImages/:id', upload.array('orderPhotos', 12), addOrderImages);

// add Driver respinses on order
router.put('/api/order/addResponses/:id', addDriversReponses);

// get Responded Drivers Notification
router.get('/api/order/getResponses/:id', getDriversReponses);

// get All orders of a customer
router.get('/api/order/getOrdersOfCustomers/:id', getAllOrdersOfCustomer);

// get Single order of a customer
router.get('/api/order/getSingleOrderOfCustomer/:postedBy/:id', getSingleOrderOfCustomer);

// get Single order for a driver
router.get('/api/order/getSingleOrderForDriver/:id', getSingleOrderforDriver);

// get all pending orders of a driver
router.get('/api/order/getPendingOrdersOfDriver/:id', getAllPendingOrdersOfDriver);

// get all cancelled orders of a driver
router.get('/api/order/getCompletedOrdersOfDriver/:id', getAllCompletedOrdersOfDriver);

// delete Single order of a customer
router.delete('/api/order/deleteOrderOfCustomer/:postedBy/:id', deleteSingeleOrder);

// sending respnse to driver's request
router.put('/api/order/acceptDriverRequest/:id/:driverId', acceptDriverRequest);

// Order Collected By Driver
router.put('/api/order/orderCollectedByDriver/:id/:recievedBy', orderCollctedByDriver);

// starting order
router.put('/api/order/startOrder/:id/:driverId', orderAcceptByDriver);

// chnage order status
router.put('/api/order/changeStatus/:id/:driverId', changeOrderStatus);

// cancel order by driver
router.put('/api/order/cancelOrderByDriver/:id/:recievedBy', deleteSingeleOrderByDriver);

// cancel order by merchent
router.put('/api/order/cancelOrderByMerchent/:id/:postedBy', cancelOrderByMerchent);

//  make Stripe Pyament
router.put('/api/order/makePayment', makeStripePayment);

//  calculate driver and admin amount
router.put('/api/order/addDriverAndAdminAmt/:id', calacFinalAmt);

//  adding tip
router.put('/api/order/addTipToDriver/:id', addTipAmount);

//  get single order for admin
router.get('/api/order/getSingleOrderForAmin/:id', getSingleOrderOfAdmin);

//  adding review
router.put('/api/order/addReveiewToOrder/:id/:postedBy', reviewOfOrder);

//  make thawani payment
router.put('/api/order/makeThawaniPayments/:id', makeThawaniPayments);

// get all oders count
router.get('/api/order/getAllCount', getAllOrdersCount);

// get all oders for admin
router.get('/api/order/getAll', getAllOrders);

// get all recent oders
router.get('/api/order/getAllRecentOrders', getRecentOrders);

// ordr confirm reached by driver
router.put('/api/order/orderReached/:id/:driverId', upload.single("orderRecieptPic"), orderCompletedByDriver);

// get all cancelled orders reasons
router.get('/api/order/getAllcanceleldOrdersReasons', getCancelledOrders);

// get all cancelled orders reasons by drivers
router.get('/api/order/getAllcanceleldOrdersByDriversReasons', getCancelledOrdersByDrivers);

// send Mail
router.put('/api/order/SendMail', sendMail);

module.exports = router;