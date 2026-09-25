const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json());

// Fake Hotels Mock Database
const hotels = [
  {
    id: 1,
    name: "The Grand Horizon",
    city: "New York",
    rating: 4.8
  },
  {
    id: 2,
    name: "Ocean Breeze Resort",
    city: "Miami",
    rating: 4.3
  },
  {
    id: 3,
    name: "Alpine Timber Lodge",
    city: "Denver",
    rating: 4.5
  },
  {
    id: 4,
    name: "Urban Nest Hotel",
    city: "Chicago",
    rating: 4.1
  }
];

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/hotels', async (req, res) => {
    const result = await pool.query('SELECT * FROM hotels');
    res.status(200).json(result.rows);
});

app.get('/hotels/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: `Hotel with ID ${id} not found.` });
    }

    res.status(200).json(result.rows[0]);
});

module.exports = app;