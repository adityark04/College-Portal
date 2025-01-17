require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./attendance.db');

const runAsync = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

(async () => {
  try {
    console.log('Initializing database...');

    // Create tables
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);
    console.log('Table `users` created.');

    await runAsync(`
      CREATE TABLE IF NOT EXISTS professors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);
    console.log('Table `professors` created.');

    await runAsync(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        division TEXT
      )
    `);
    console.log('Table `students` created.');

    await runAsync(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL UNIQUE,
        status TEXT CHECK(status IN ('Present', 'Absent')),
        FOREIGN KEY(student_id) REFERENCES students(id)
      )
    `);
    console.log('Table `attendance` created.');

    // Insert sample data
    await runAsync(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['admin', '123']);
    await runAsync(`INSERT OR IGNORE INTO professors (username, password) VALUES (?, ?)`, ['prof1', 'password123']);
    await runAsync(`INSERT OR IGNORE INTO students (name, division) VALUES (?, ?)`, ['John Doe', 'Div A']);
    console.log('Sample data inserted successfully.');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database closed successfully.');
      }
    });
  }
})();
