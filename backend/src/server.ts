import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import testRoutes from './routes/testRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import stockMovementRoutes from './routes/stockMovementRoutes';
import challanRoutes from './routes/challanRoutes';
import userRoutes from './routes/userRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Parth Mobile Distribution API is running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
