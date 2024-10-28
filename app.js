const express = require('express');
const itemRoutes = require('./routes/itemRoutes');
const externalAPIRoutes = require('./routes/externalAPIRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const userRoutes = require('./routes/userRoutes');
// const logisticsRoutes = require('./routes/logisticsRoutes'); 
const errorHandler = require('./utils/errorHandler');
<<<<<<< HEAD
const cors = require('cors'); // CORS middleware
=======
const deliveriesRouter = require('./routes/logisticsRoutes');
>>>>>>> 293c9c34b0c5d2c63f16c1030f06f4cc3b441c7c
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Use the routes
app.use('/api/items', itemRoutes);
app.use('/api/external', externalAPIRoutes);
app.use('/api/payment', paymentRoutes);
<<<<<<< HEAD
app.use('/api/rentals', rentalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logistics', logisticsRoutes); 
=======
app.use('/api/rentals', rentalRoutes); // Add rental routes
app.use('/api/users', userRoutes); // Add the user routes
// app.use('/api/logistics', logisticsRoutes); 
app.use('/api/deliveries', deliveriesRouter);
>>>>>>> 293c9c34b0c5d2c63f16c1030f06f4cc3b441c7c

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Sync database and then start the server
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully');
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1); // Exit with failure
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close(); // Close database connection
  console.log('Database connection closed');
  process.exit(0); // Exit gracefully
});
