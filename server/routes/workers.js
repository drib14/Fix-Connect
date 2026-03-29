const express = require('express');
const router = express.Router();
const { getWorkers } = require('../controllers/workerController');

router.get('/', getWorkers);

module.exports = router;
