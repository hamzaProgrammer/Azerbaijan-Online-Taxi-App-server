const express = require('express');
const router = express.Router();
const {
    addNewRegion,
    getSingleRegion,
    getAllRegions,
    delSingleRegion,
    updateSingleregion
} = require('../controllers/RegionsController')



// add Announcement
router.post('/api/regions/addNew', addNewRegion)

// update radius
router.put('/api/regions/updateSingle/:id', updateSingleregion)

// get all regions
router.get('/api/regions/getAll', getAllRegions);

// get single region
router.get('/api/regions/getSingle/:id', getSingleRegion);

// delete single announcement
router.delete('/api/reguons/deleteSingle/:id', delSingleRegion);

// // get announcements count
// router.get('/api/announcements/getCount', getAllAnnouncementsCount);

module.exports = router;