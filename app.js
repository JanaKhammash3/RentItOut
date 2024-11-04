const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv');
dotenv.config();

const itemRoutes = require('./routes/itemRoutes');
const externalAPIRoutes = require('./routes/externalAPIRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const userRoutes = require('./routes/userRoutes');
const deliveriesRouter = require('./routes/logisticsRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); 
const insuranceRoute = require('./routes/insuranceRoute');

const errorHandler = require('./utils/errorHandler');
const sequelize = require('./config/database');


const app = express();


app.use(cors()); 
app.use(express.json()); 


app.use('/api/items', itemRoutes);
app.use('/api/external', externalAPIRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rentals', rentalRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/reviews', reviewRoutes); 
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/insurance', insuranceRoute);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1); 
  }
};

startServer();


process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close(); 
  console.log('Database connection closed');
  process.exit(0); 
});
