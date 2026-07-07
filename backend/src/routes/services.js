const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getServices,
  getServiceById,
  getCategories,
} = require('../controllers/serviceController');

router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/:id', getServiceById);

module.exports = router;
