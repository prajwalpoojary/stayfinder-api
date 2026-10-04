const express = require('express');
const app = express();
const pool = require('./db');
const { z } = require('zod');

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

const createHotelSchema = z.object({
  name: z.string().min(1, 'name is required'),
  city: z.string().min(1, 'city is required'),
  rating: z.number().min(0).max(5).optional(),
});


function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Return a 400 Bad Request with the validation errors
      return res.status(400).json({
        status: 'fail',
        errors: result.error.errors
      });
    }

    // Override req.body with the safely parsed/stripped data and proceed
    req.body = result.data;
    next();
  };
}

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Something went wrong.';

  res.status(statusCode).json({
    status: 'error',
    message,
  });
}

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/hotels', async (req, res) => {
    const result = await pool.query('SELECT * FROM hotels');
    res.status(200).json(result.rows);
});

app.post('/hotels', validateBody(createHotelSchema), async (req, res) => {
  const { name, city, rating } = req.body;
  const result = await pool.query(
    'INSERT INTO hotels (name, city, rating) VALUES ($1, $2, $3) RETURNING *',
    [name, city, rating]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/hotels/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        // return res.status(404).json({ message: `Hotel with ID ${id} not found.` });
        throw new AppError(404, `Hotel with ID ${id} not found.`);
    }

    res.status(200).json(result.rows[0]);
});

app.use(errorHandler);

module.exports = app;