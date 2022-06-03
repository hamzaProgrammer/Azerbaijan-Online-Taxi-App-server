const express = require('express');
const router = express.Router();
const {
    SignUpAdmin,
    LogInAdmin,
    checkBalance,
} = require('../controllers/AdminControllers')


// Sign Up Admin
router.post('/api/admins/signup', SignUpAdmin)

// Sign In Admin
router.post('/api/admins/signin', LogInAdmin)

// get balance details
router.get('/api/admins/getAvailBalance/:id', checkBalance);




module.exports = router;