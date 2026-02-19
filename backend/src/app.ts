import express from 'express';
import cors from 'cors';
import { AuthRequest } from './middleware/auth';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import goalRoutes from './routes/goals';
import financeRoutes from './routes/finance';
import calendarRoutes from './routes/calendar';

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  const request = req as AuthRequest;
  request.userId = request.userId ?? 1;
  next();
});

app.use('/', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/goals', goalRoutes);
app.use('/finance', financeRoutes);
app.use('/calendar', calendarRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

export default app;