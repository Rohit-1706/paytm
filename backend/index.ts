import type { Application, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index';

const app: Application = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());


app.use("/api/v1", mainRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});