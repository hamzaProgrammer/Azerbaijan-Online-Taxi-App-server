const express = require('express');
const router = express.Router();
const {
    addAnnouncement,
    getAnnouncments,
    getSingleAnnoncements,
    updateSingleAnnouncement,
    delSingleAnnoncements,
    getAllAnnouncementsCount
} = require('../controllers/AnnouncmentController')



// add Announcement
router.post('/api/announcments/addNew', addAnnouncement)

// update radius
router.put('/api/announcments/updateSingle/:id', updateSingleAnnouncement)

// get all Announcments
router.get('/api/announcements/getAll', getAnnouncments);

// get single announcements
router.get('/api/announcements/getSingle/:id', getSingleAnnoncements);

// delete single announcement
router.delete('/api/announcements/deleteSingle/:id', delSingleAnnoncements);

// get announcements count
router.get('/api/announcements/getCount', getAllAnnouncementsCount);

module.exports = router;