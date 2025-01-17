# Attendance Tracker Web Application

## Project Description
This project is a web-based attendance tracker for a college. Professors can log in, select a division (e.g., Div A or Div B), and mark student attendance. The system allows for the addition and removal of students and provides a dashboard that displays individual student attendance records on a monthly basis.

### Features
- **Add Students**: Professors can add students by entering their name, roll number, and division.
- **View Students**: The dashboard displays all students for a selected division in a tabular format.
- **Delete Students**: Professors can delete a student directly from the dashboard.
- **Attendance Tracking**: Attendance data can be managed (future implementation).

---

## Technologies Used
- **Frontend**:
  - HTML5
  - CSS3 (with Bootstrap for styling)
  - JavaScript (for dynamic actions and API interactions)

- **Backend**:
  - Node.js with Express.js framework
  - SQLite3 for the database

- **Environment**:
  - dotenv for environment variable management

---

## Project Structure
```plaintext
attendance-tracker/
├── app.js              # Backend application logic
├── init-db.js          # Script to initialize the database
├── .env                # Environment variables
├── views/              # Frontend HTML files
│   ├── login.html      # Login page (future implementation)
│   ├── dashboard.html  # Dashboard for managing students
│   └── add-student.html # (Obsolete, integrated into dashboard)
├── public/             # Static assets
│   ├── css/            # CSS files
│   └── js/             # JavaScript files
├── node_modules/       # Dependencies
├── package.json        # Project metadata and dependencies
├── .gitignore          # Ignored files for Git
└── README.md           # Project documentation
```

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd attendance-tracker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   DATABASE_URL=./attendance.db
   ```

4. **Initialize the Database**:
   ```bash
   node init-db.js
   ```

5. **Start the Application**:
   ```bash
   node app.js
   ```

6. **Access the Application**:
   Open a browser and navigate to:
   ```plaintext
   http://localhost:3000
   ```

---

Screenshots of the project 

1.Login page

  ![image](https://github.com/user-attachments/assets/faa7a447-3ca0-4c63-9aa6-10382ae6bbda)

2. Home page

  ![image](https://github.com/user-attachments/assets/b0652ebd-26a6-4b78-b50d-679567d1ff8a)
Select division A or B or C acording to your requirements.

3.  Marking attendance

  ![image](https://github.com/user-attachments/assets/7f116248-7e6b-4f6a-bb6d-be279f728d46)

---
## API Endpoints

### 1. Get Students
**Endpoint**: `/api/students`
- **Method**: `GET`
- **Query Parameters**:
  - `division` (required): Division to filter students (e.g., `A` or `B`).
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "roll_number": 101,
      "division": "A"
    }
  ]
  ```

### 2. Add Student
**Endpoint**: `/api/students`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "roll_number": 101,
    "division": "A"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "message": "Student added successfully!"
  }
  ```

### 3. Delete Student
**Endpoint**: `/api/students/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "Student deleted successfully."
  }
  ```

---

## Future Enhancements
- Implement user authentication for professors.
- Add functionality to mark attendance.
- Display monthly attendance summaries for students.
- Create export options (e.g., download attendance reports).

---

## Contributing
1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add some feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

## Acknowledgments
- SQLite documentation for database management.
- Express.js for server-side routing.
- Bootstrap for responsive styling.

