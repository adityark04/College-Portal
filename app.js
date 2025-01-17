require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database(process.env.DB_PATH || './attendance.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Login API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err.message);
      return res.status(500).send('Internal server error.');
    }
    if (row) {
      res.redirect('/select-division');
    } else {
      res.status(401).send('Invalid username or password.');
    }
  });
});

// Division selection page
app.get('/select-division', (req, res) => {
  res.sendFile(path.join(__dirname, 'select-division.html'));
});

// Show dashboard for a selected division
app.get('/dashboard', (req, res) => {
  const division = req.query.division;
  if (!division) {
    return res.status(400).send('Division is required.');
  }

  const query = `
    SELECT students.name, students.division, attendance.status, students.id
    FROM students
    LEFT JOIN attendance
    ON students.id = attendance.student_id
    WHERE students.division = ?
    ORDER BY students.name
  `;
  
  db.all(query, [division], (err, rows) => {
    if (err) {
      console.error('Error fetching students:', err.message);
      return res.status(500).send('Internal server error.');
    }

    const studentTableRows = rows
      .map(row => `
        <tr>
          <td>${row.name}</td>
          <td>${row.division}</td>
          <td>${row.status || 'Absent'}</td>
          <td>
            <form action="/update-attendance" method="POST">
              <input type="hidden" name="attendance[0][student_id]" value="${row.id}" />
              <input type="hidden" name="attendance[0][division]" value="${division}" />
              <select name="attendance[0][status]">
                <option value="Present" ${row.status === 'Present' ? 'selected' : ''}>Present</option>
                <option value="Absent" ${row.status === 'Absent' ? 'selected' : ''}>Absent</option>
              </select>
              <button type="submit">Update</button>
            </form>
          </td>
          <td>
            <form action="/delete-student" method="POST">
              <input type="hidden" name="student_id" value="${row.id}" />
              <button type="submit" class="btn btn-danger">Delete</button>
            </form>
          </td>
        </tr>
      `)
      .join('');

    const dashboardHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="container my-4">
          <h2>Welcome, Professor - Division: ${division}</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Division</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>${studentTableRows}</tbody>
          </table>
          <a href="/add-student.html?division=${division}" class="btn btn-success">Add Student</a>
          <a href="/select-division" class="btn btn-secondary">Back</a> <!-- Back button -->
        </div>
      </body>
      </html>
    `;
    res.send(dashboardHtml);
  });
});

// Update attendance
app.post('/update-attendance', (req, res) => {
  const { attendance } = req.body;
  if (!attendance || attendance.length === 0) {
    return res.status(400).send('No attendance data received.');
  }

  const updateQuery = `
    INSERT INTO attendance (student_id, status)
    VALUES (?, ?)
    ON CONFLICT(student_id) DO UPDATE SET status = excluded.status
  `;

  const promises = attendance.map(({ student_id, status }) => {
    return new Promise((resolve, reject) => {
      db.run(updateQuery, [student_id, status], function (err) {
        if (err) {
          console.error(`Error updating student ID ${student_id}:`, err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      console.log('Attendance updated successfully.');
      const division = attendance[0].division;
      res.redirect(`/dashboard?division=${division}`);
    })
    .catch(err => {
      console.error('Failed to update attendance:', err.message);
      res.status(500).send('Failed to update attendance.');
    });
});

// Delete student
app.post('/delete-student', (req, res) => {
  const studentId = req.body.student_id;

  // Delete attendance record for the student first
  db.run('DELETE FROM attendance WHERE student_id = ?', [studentId], (err) => {
    if (err) {
      console.error(`Error deleting attendance for student ID ${studentId}:`, err.message);
      return res.status(500).send('Failed to delete attendance.');
    }

    // Then delete the student
    db.run('DELETE FROM students WHERE id = ?', [studentId], (err) => {
      if (err) {
        console.error(`Error deleting student ID ${studentId}:`, err.message);
        return res.status(500).send('Failed to delete student.');
      }

      console.log(`Student ID ${studentId} deleted successfully.`);
      res.redirect('/dashboard');
    });
  });
});

// Add student page
app.get('/add-student.html', (req, res) => {
  const division = req.query.division;
  if (!division) {
    return res.status(400).send('Division is required.');
  }

  const addStudentHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Add Student</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="container my-4">
        <h2>Add a New Student</h2>
        <form action="/add-student" method="POST">
          <div class="mb-3">
            <label for="name" class="form-label">Student Name</label>
            <input type="text" class="form-control" id="name" name="name" required>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" name="email" required>
          </div>
          <div class="mb-3">
            <label for="division" class="form-label">Division</label>
            <input type="text" class="form-control" id="division" name="division" value="${division}" readonly>
          </div>
          <button type="submit" class="btn btn-primary w-100">Add Student</button>
        </form>
        <a href="/dashboard?division=${division}" class="btn btn-secondary mt-3">Back</a> <!-- Back button -->
      </div>
    </body>
    </html>
  `;

  res.send(addStudentHtml);
});

// Save new student
app.post('/add-student', (req, res) => {
  const { name, email, division } = req.body;
  if (!division) {
    return res.status(400).send('Division is required.');
  }

  db.run('INSERT INTO students (name, email, division) VALUES (?, ?, ?)', [name, email, division], function (err) {
    if (err) {
      console.error('Error adding student:', err.message);
      return res.status(500).send('Failed to add student.');
    }
    console.log(`Student added with ID: ${this.lastID}`);
    res.redirect(`/dashboard?division=${division}`);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
