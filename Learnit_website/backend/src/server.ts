import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import apiRoutes from './routes';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev')); // Add logging

// Debug middleware to log all requests
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
connectDB();

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((_req, res) => {
  console.log(`404 - Not Found: ${_req.method} ${_req.url}`);
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 