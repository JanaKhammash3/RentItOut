//Integrates with external APIs (e.g., Google Maps).
const axios = require('axios');
const { Insurance } = require('../models/insuranceModel'); // Import the Insurance model

exports.getLocationData = async (req, res, next) => {
    try {
        const { address } = req.params;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
        );
        res.json(response.data);
    } catch (error) {
        next(error);
    }
};

exports.verifyInsurance = async (req, res, next) => {
    try {
        const { userId, policyId } = req.body;
        const insuranceApiUrl = 'https://api.insuranceprovider.com/verify';

        const response = await axios.post(insuranceApiUrl, { userId, policyId });

        if (response.data.verified) {
            await Insurance.update({ status: 'verified' }, { where: { id: policyId } });
            res.json({ message: 'Insurance verified successfully.' });

        } else {
            res.status(400).json({ message: 'Insurance verification failed.' });
        }
    } catch (error) {
        next(error);
    }
};

///////////
exports.getMapUrl = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Coordinates are required.' });
    }

    // Construct Google Maps URL with the coordinates and API key from .env
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap
        &markers=color:red%7Clabel:C%7C${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    return res.status(200).json({ mapUrl });
};
