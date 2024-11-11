const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(__dirname + "/public"));

// Load and parse the Excel file
const workbook = xlsx.readFile(path.join(__dirname, 'prof_grades.xlsx'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(worksheet);



// Ensure consistency in data fields by trimming whitespace and converting types
const formattedData = data.map(row => ({
    Year: String(row.Year).trim(),
    Semester: String(row.Semester).trim(),
    Course: String(row.Course).trim(),
    Grade: row.Grade,
    Count: row.Count
}));

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public/index.html'));
});

// Search for a course by name
app.get('/search', (req, res) => {
    const courseName = (req.query.course_name || '').trim();
    const results = formattedData.filter(row =>
        row.Course.toLowerCase().includes(courseName.toLowerCase())
    );
    res.json(results.map(row => ({
        Year: row.Year,
        Semester: row.Semester,
        Course: row.Course,
        Grade: row.Grade,
        Count: row.Count
    })));
});

// Suggest course names based on a query
app.get('/suggest', (req, res) => {
    const searchText = (req.query.query || '').trim();
    const suggestions = [...new Set(
        formattedData
            .filter(row => row.Course.toLowerCase().includes(searchText.toLowerCase()))
            .map(row => row.Course)
    )];
    res.json(suggestions);
});

// Get available years for a specific course
app.get('/get_years', (req, res) => {
    const courseName = (req.query.course_name || '').trim();
    const years = [...new Set(
        formattedData
            .filter(row => row.Course === courseName)
            .map(row => row.Year)
    )];
    res.json(years);
});

// Get available semesters for a specific course and year
app.get('/get_semesters', (req, res) => {
    const courseName = (req.query.course_name || '').trim();
    const year = (req.query.year || '').trim();
    const semesters = [...new Set(
        formattedData
            .filter(row => row.Course === courseName && row.Year === year)
            .map(row => row.Semester)
    )];
    res.json(semesters);
});

// Get grades and counts for a specific course, year, and semester
app.get('/get_grades', (req, res) => {
    const courseName = (req.query.course_name || '').trim();
    const year = (req.query.year || '').trim();
    const semester = (req.query.semester || '').trim();

    const results = formattedData
        .filter(row =>
            row.Course === courseName &&
            row.Year === year &&
            row.Semester === semester
        )
        .sort((a, b) => a.Grade.localeCompare(b.Grade))
        .map(row => ({
            Semester: row.Semester,
            Grade: row.Grade,
            Count: row.Count
        }));

    res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
