require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const client = require('prom-client');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}));

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 400, 500, 1000]
});

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

let db;

function connectWithRetry() {
  db = mysql.createConnection(dbConfig);
  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Connected to MySQL database');
      initializeTables();
    }
  });

  db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

function initializeTables() {
  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      category VARCHAR(255) NOT NULL
    );
  `;
  const createSalaryTable = `
    CREATE TABLE IF NOT EXISTS salary (
      id INT PRIMARY KEY,
      amount DECIMAL(10, 2) NOT NULL
    );
  `;
  db.query(createExpensesTable, (err) => {
    if (err) {
      console.error('Error creating expenses table:', err);
    } else {
      console.log('Expenses table created or already exists');
    }
  });
  db.query(createSalaryTable, (err) => {
    if (err) {
      console.error('Error creating salary table:', err);
    } else {
      console.log('Salary table created or already exists');
    }
  });
}

// Start the connection process
connectWithRetry();

// Middleware to track metrics for all routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});

// Database connection check middleware
const checkDbConnection = (req, res, next) => {
  if (!db || db.state === 'disconnected') {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  next();
};

// API Endpoints
app.get('/expenses', checkDbConnection, (req, res) => {
  db.query('SELECT * FROM expenses', (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    res.json(results);
  });
});

app.post('/expenses', checkDbConnection, (req, res) => {
  const { description, amount, date, category } = req.body;
  
  if (!description || amount === undefined || !date || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO expenses (description, amount, date, category) VALUES (?, ?, ?, ?)';
  db.query(query, [description, amount, date, category], (err, results) => {
    if (err) {
      console.error('Error adding expense:', err);
      return res.status(500).json({ error: 'Failed to add expense' });
    }
    res.status(201).json({ id: results.insertId, description, amount, date, category });
  });
});

app.get('/salary', checkDbConnection, (req, res) => {
  db.query('SELECT amount FROM salary WHERE id = 1', (err, results) => {
    if (err) {
      console.error('Error fetching salary:', err);
      return res.status(500).json({ error: 'Failed to fetch salary' });
    }
    res.json(results[0] ? results[0].amount : 0);
  });
});

app.post('/salary', checkDbConnection, (req, res) => {
  const { amount } = req.body;
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount provided' });
  }

  const query = 'REPLACE INTO salary (id, amount) VALUES (1, ?)';
  db.query(query, [amount], (err) => {
    if (err) {
      console.error('Error updating salary:', err);
      return res.status(500).json({ error: 'Failed to update salary' });
    }
    res.status(201).json({ amount });
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;