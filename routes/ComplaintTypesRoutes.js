const express = require('express');
const router = express.Router();
const {
    addComplaintType,
    getAllComplaintTypes,
    getSingleComplaintsTypes,
    updateSingleComplaintsTypes,
    delSingleComplaintType,
    getAllComplaintsTypesCount
} = require('../controllers/CompliantTypesController')


// add new service
router.post('/api/complaintType/addNew', addComplaintType)

// update complaint type
router.put('/api/complaintType/updateSingle/:id', updateSingleComplaintsTypes)

// delete service
router.delete('/api/complaintType/deleteSingle/:id', delSingleComplaintType);

// get all complaint types
router.get('/api/complaintTypes/getAll', getAllComplaintTypes);

// get single ComplaintsTypes
router.get('/api/compliantTypes/getSingle/:id', getSingleComplaintsTypes);

// get all complaint types  count
router.get('/api/complaintTypes/getCount', getAllComplaintsTypesCount);


module.exports = router;