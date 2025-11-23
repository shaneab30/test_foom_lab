import express from 'express';
import db from './src/models/index.js'; 
const { sequelize } = db;
import cors from 'cors';

import productRoutes from './src/routes/productRoutes.js';
import warehouseRoutes from './src/routes/warehouseRoutes.js';
import stockRoutes from './src/routes/stockRoutes.js';
import purchaseRequestRoutes from './src/routes/purchaserequestRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/products', productRoutes);
app.use('/warehouses', warehouseRoutes);
app.use('/stocks', stockRoutes);
app.use('/purchase/request', purchaseRequestRoutes);
app.use('/webhook', webhookRoutes);

// Start server + test database
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
};

startServer();
