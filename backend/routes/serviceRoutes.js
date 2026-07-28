const express = require("express");
const router = express.Router();
const { getServices, getNearbyProviders } = require("../controllers/serviceController");

router.get("/", getServices);
router.get("/nearby-providers", getNearbyProviders);

module.exports = router;
