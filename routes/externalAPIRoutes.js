const express = require('express');
const router = express.Router();
const externalAPIController = require('../controllers/externalAPIController'); 

const { getLocationData, getMapUrl } = externalAPIController;

router.get('/location', getMapUrl); 
router.get('/location/:address', getLocationData);

module.exports = router;

