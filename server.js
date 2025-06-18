// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/movies', async (req, res) => {
  const { query } = req.query;
  const OMDB_API_KEY = process.env.OMDB_API_KEY;

  const url = query
    ? `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`
    : `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=batman`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from OMDb' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
