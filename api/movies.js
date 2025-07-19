// api/movies.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables if running locally (Vercel handles them automatically)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// Use CORS to allow requests from your frontend
app.use(cors());

// Define the API endpoint that your frontend will call
// This will be accessible at /api/movies relative to your deployed app's URL
app.get('/api/movies', async (req, res) => {
  const { query } = req.query;
  // Access the API key from Vercel's environment variables
  const OMDB_API_KEY = process.env.OMDB_API_KEY;

  // Basic validation for the API key
  if (!OMDB_API_KEY) {
    return res.status(500).json({ error: 'OMDb API key not configured.' });
  }

  // Construct the OMDb API URL
  const url = query
    ? `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`
    : `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=batman`; // Default search

  try {
    const response = await fetch(url);
    if (!response.ok) {
        // Handle non-2xx responses from OMDb API
        const errorData = await response.json();
        console.error(`OMDb API error: ${response.status} - ${errorData.Error || 'Unknown error'}`);
        return res.status(response.status).json({ error: errorData.Error || 'Failed to fetch movies from OMDb' });
    }
    const data = await response.json();

    // Send the data back to the frontend
    res.json(data);
  } catch (err) {
    console.error('Error fetching from OMDb:', err);
    res.status(500).json({ error: 'Failed to fetch movies due to an internal server error.' });
  }
});

// Export the app for Vercel to use as a serverless function
export default app;