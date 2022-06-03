const express = require('express');
const router = express.Router();
const {
    addNewService,
    getAllServices,
    getSingleServices,
    updateSingleServices,
    deleteService,
    getAllServicesCount
} = require('../controllers/ServicesController')


// add new service
router.post('/api/services/addNew', addNewService)

// update service
router.put('/api/services/updateSingle/:id', updateSingleServices)

// delete service
router.delete('/api/services/deleteService/:id', deleteService);

// get all services
router.get('/api/services/getAll', getAllServices);

// get single service
router.get('/api/services/getSingle/:id', getSingleServices);

// get all services count
router.get('/api/services/getSingleCount', getAllServicesCount);


module.exports = router;