const express = require('express');
const itemRoutes = require('./routes/itemRoutes');
const externalAPIRoutes = require('./routes/externalAPIRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rentalRoutes = require('./routes/rentalRoutes'); // Import rental routes
const userRoutes = require('./routes/userRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes'); 
const errorHandler = require('./utils/errorHandler');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();

app.use(express.json());

// Use the routes
app.use('/api/items', itemRoutes);
app.use('/api/external', externalAPIRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/rentals', rentalRoutes); // Add rental routes
app.use('/api/users', userRoutes); // Add the user routes
app.use('/api/logistics', logisticsRoutes); 

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
