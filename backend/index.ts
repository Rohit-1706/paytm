import type { Application, Request, Response } from 'express';
import express from 'express';
import mainRouter from './routes/index';
import cors from 'cors';

const app: Application = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());


app.use("/api/v1", mainRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});