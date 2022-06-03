const express = require('express');
const router = express.Router();
const {
    getRadiuses,
    updateSingleRadius,
    getSingleRadiuses,
} = require('../controllers/RadiusController')

// update radius
router.put('/api/radiuses/updateSingle/:id', updateSingleRadius)

// get all radius
router.get('/api/radiuses/getAll', getRadiuses);

// get single radius
router.get('/api/radiuses/getSingle/:id', getSingleRadiuses);

module.exports = router;