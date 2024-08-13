const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'expense_manager'
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');

  // Create tables if they do not exist
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
    if (err) throw err;
    console.log('Expenses table created or already exists');
  });

  db.query(createSalaryTable, (err) => {
    if (err) throw err;
    console.log('Salary table created or already exists');
  });
});

// API Endpoints
app.get('/expenses', (req, res) => {
  db.query('SELECT * FROM expenses', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/expenses', (req, res) => {
  const { description, amount, date, category } = req.body;
  const query = 'INSERT INTO expenses (description, amount, date, category) VALUES (?, ?, ?, ?)';
  db.query(query, [description, amount, date, category], (err, results) => {
    if (err) throw err;
    res.status(201).json({ id: results.insertId, description, amount, date, category });
  });
});

// New endpoints for salary
app.get('/salary', (req, res) => {
  db.query('SELECT amount FROM salary WHERE id = 1', (err, results) => {
    if (err) throw err;
    res.json(results[0] ? results[0].amount : 0);
  });
});

app.post('/salary', (req, res) => {
  const { amount } = req.body;
  const query = 'REPLACE INTO salary (id, amount) VALUES (1, ?)';
  db.query(query, [amount], (err) => {
    if (err) throw err;
    res.status(201).json({ amount });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
