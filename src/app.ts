import express, { Express } from 'express';
import cors from 'cors';
import checkinRoutes from './routes/checkin';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/checkin', checkinRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'checkin-validation-service' });
});

export default app;
