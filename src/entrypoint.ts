import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import 'reflect-metadata';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'EngLa API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
