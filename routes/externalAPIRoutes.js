const express = require('express');
const router = express.Router();
const externalAPIController = require('../controllers/externalAPIController'); 

// Extracting the function
const { getLocationData, verifyInsurance, getMapUrl } = externalAPIController;

//  route to handle latitude and longitude
router.get('/location', getMapUrl); 
router.get('/location/:address', getLocationData);
router.post('/insurance/verify', verifyInsurance);

module.exports = router;
