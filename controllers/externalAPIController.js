//Integrates with external APIs (e.g., Google Maps).
const axios = require('axios');

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
            res.json({ message: 'Insurance verified successfully.' });
        } else {
            res.status(400).json({ message: 'Insurance verification failed.' });
        }
    } catch (error) {
        next(error);
    }
};

