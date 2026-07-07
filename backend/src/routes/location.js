const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  searchAddress,
  reverseGeocode,
} = require('../controllers/locationController');

router.get('/search', auth, searchAddress);
router.get('/reverse', auth, reverseGeocode);

module.exports = router;
