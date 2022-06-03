const express = require('express');
const router = express.Router();
const {
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
    SignInUserAdmin,
} = require('../controllers/CustomerController')
const multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './customerPics/')
        //cb(null, '../products')
    },
    filename: function (req, file, cb) {
        cb(null, 'customer-' + Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
});

// Sign Up Customer
router.post('/api/customer/signin', SignInUser)

// Upadte verification Stataus
router.put('/api/customer/changeVerifyStatus/:id', updateUserStatus);

// add new location
router.put('/api/customer/saveNewLocation/:id', AddUserNewLocations);

// delete any saved location
router.put('/api/customer/deleteSavedLocation/:id', updateCustLocations);

// getting saved location
router.get('/api/customer/getSavedLocation/:id', getUserSavedLocations);

// Update user info
router.put('/api/customer/updateProfile/:id', updateCustomer);

// Update user info
router.put('/api/customer/updateProfilePicOnly/:id', upload.single("profilePic"), updateCustomerProfileImg);

// Update user location
router.put('/api/customer/updateLocation/:id', updateCustomerLocation);

// Update user location
router.put('/api/customer/updateLocation/:id', updateCustLocation);

// get merchents count
router.get('/api/customer/getCount', getAllMerchentsCount);

// get merchents
router.get('/api/customer/getAll', getAllMerchents);

// get merchent profile info
router.get('/api/customer/getProfileInfo/:id', getSingleMerchent);

// get merchent data
router.get('/api/customer/getMerchent/:id', getMerchent);

// sign up merchent
router.post('/api/customer/signUpByAdmin', SignInUserAdmin);

// update merchent profile info
router.put('/api/customer/updateWholeProfile/:id', upload.single("profilePic") ,  UpdateSingleMerchent);


module.exports = router;