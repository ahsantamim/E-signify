import express from 'express';
import cors from 'cors';
import templateRoutes from './routes/template.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Mount the routes
app.use('/api/templates', templateRoutes); // Make sure this path matches

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app; 