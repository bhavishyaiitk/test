let allCourses = []; // To store all courses fetched from the server
let visibleCoursesCount = 10; // Number of courses to show initially

// Show or hide the sections based on button clicks
const colorMapping = {
    'A*': '#00FFFF', // Cyan
    'A': '#006400',  // Dark Green
    'B+': '#228B22', // Green
    'B': '#32CD32',  // Lime Green
    'C+': '#FFD700', // Yellow
    'C': '#FFFF00',  // Yellow
    'D+': '#FFCC00', // Light Yellow
    'D': '#FF6347',  // Tomato
    'F': '#FF0000',  // Red
    'S': '#1E90FF',  // Dodger Blue
    'X': '#800080',  // Purple
    // Add any other grades you need here
};

// Show or hide the sections based on button clicks
function showSearchCourses() {
    document.body.innerHTML = `
        <div id="searchCoursesSection">
            <div id="homepageButtonContainer">
                <button id="homepageButton" onclick="goToHomepage()">Homepage</button>
            </div>
            <div class="left-align-wrapper">
                <div id="selectCourseBox">Select Course here</div>
                <input type="text" id="courseInput" placeholder="Type course name">
                <div id="suggestions" style="display: none;"></div>
            </div>


            <div id="yearSelection" style="display: none;">
                <div class="left-align-wrapper">
                    <div id="selectCourseBox">Select a Year</div>
                    <div id="yearList" style="display: none;"></div> <!-- Added yearList div -->
                </div>
            </div>

           <!-- Semester Selection Section -->
            <div id="semesterSelection" style="display: none;">
                <div class="left-align-wrapper">
                    <div id="selectCourseBox">Select Semester:</div>
                    <div id="semesterList"></div>
                </div>
            </div>

            
        </div>

        <div class="footer">
            Made by Bhavishya, Y21, with complete use of ChatGPT.
        </div>
    `;

    // Attach event listener for input after rendering HTML content
    document.getElementById('courseInput').addEventListener('input', fetchSuggestions);
}

function goToHomepage() {
    // Hide all sections except for the homepage buttons
    location.reload();
}

// Fetch course suggestions based on input
async function fetchSuggestions() {
    const query = document.getElementById('courseInput').value;
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions
    

    if (query.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/suggest?query=${query}`);
        const suggestions = await response.json();
        let count = 0;

        for (const course of suggestions) {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.textContent = course;
            div.onclick = async () => {
                document.getElementById('courseInput').value = course;
                suggestionsBox.innerHTML = '';
                await fetchYears(course);
            };
            suggestionsBox.appendChild(div);
            count++;

            // Limit displayed items
            if (count === visibleCoursesCount) break;
        }

        if (count === visibleCoursesCount) {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.textContent = `+ ${suggestions.length - visibleCoursesCount} more courses`;
            div.onclick = () => showAllCourses(query);
            suggestionsBox.appendChild(div);
        }

        suggestionsBox.style.display = 'block';
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        suggestionsBox.innerHTML = `<p>Error fetching suggestions. Please try again.</p>`;
        suggestionsBox.style.display = 'block';
    }
}

// Show all related courses when clicking "+ more courses"
async function showAllCourses(query) {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions

    const response = await fetch(`/suggest?query=${query}`);
    const suggestions = await response.json();

    suggestions.forEach(course => {
        const div = document.createElement('div');
        div.classList.add('suggestion-item');
        div.textContent = course;
        div.onclick = () => {
            document.getElementById('courseInput').value = course;
            suggestionsBox.innerHTML = '';
            fetchYears(course);
        };
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = 'block';
}

async function fetchYears(courseName) {
    const response = await fetch(`/get_years?course_name=${courseName}`);
    const years = await response.json();

    // Sort years based on the first part (starting year)
    years.sort((a, b) => {
        const yearA = parseInt(a.split('-')[0]); // Get the first part of the year (before the hyphen)
        const yearB = parseInt(b.split('-')[0]); // Same for the second year
        return yearB - yearA; // Sort in descending order
    });

    const yearSelection = document.getElementById('yearSelection');
    const yearList = document.getElementById('yearList'); // Access yearList correctly
    

    yearSelection.style.display = 'block';
    yearList.innerHTML = ''; // Clear previous years

    years.forEach(year => {
        const div = document.createElement('div');
        div.classList.add('year-item'); // Match styling with course suggestions
        div.textContent = year;
        div.onclick = () => {
            fetchSemesters(courseName, year);
        };
        yearList.appendChild(div);
    });

    yearList.style.display = 'block'; // Make yearList visible
}


async function fetchSemesters(courseName, year) {
    const response = await fetch(`/get_semesters?course_name=${courseName}&year=${year}`);
    const semesters = await response.json();

    const semesterSelection = document.getElementById('semesterSelection');
    const semesterList = document.getElementById('semesterList');
    semesterSelection.style.display = 'block'; // Ensure the semester selection section is visible
    semesterList.innerHTML = ''; // Clear previous semesters

    if (semesters.length === 1) {
        // If there's only one semester, fetch grades directly
        fetchGrades(courseName, year, semesters[0]);
        semesterSelection.style.display = 'none'; // Hide semester selection once grades are fetched
    } else {
        // If multiple semesters, show them as options
        semesters.forEach(semester => {
            const div = document.createElement('div');
            div.classList.add('semester-item'); // Match the styling with the year items
            div.textContent = semester;
            div.onclick = () => {
                fetchGrades(courseName, year, semester); // Fetch grades on click
                // Hide semester selection after selection
            };
            semesterList.appendChild(div);
        });

        // Make sure the semester list is visible after adding options
        semesterList.style.display = 'block';
    }
}

const gradeOrder = ['A*', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'S', 'X'];
async function fetchGrades(courseName, year, semester) {
    const response = await fetch(`/get_grades?course_name=${courseName}&year=${year}&semester=${semester}`);
    const results = await response.json();

    // Ensure results container is available
    let resultsBox = document.getElementById('results');
    if (!resultsBox) {
        resultsBox = document.createElement('div');
        resultsBox.id = 'results';
        resultsBox.style.position = 'absolute';
        resultsBox.style.top = '0';
        resultsBox.style.left = '500';
        resultsBox.style.width = '50%';
        resultsBox.style.zIndex = '1000'; // Ensure it's on top of other elements
        document.body.appendChild(resultsBox);
    }

    // Clear any previous results
    resultsBox.innerHTML = `
    <body>
        <div class="box">
            <h2>Grades for ${courseName} - ${year} - ${semester}</h2>
        </div>

        <div class="results-content">
            <!-- Table and Pie chart will go here -->
        </div>
    </body>

    `;

    // Create a container to hold both the table and pie chart side by side
    const resultsContent = document.querySelector('.results-content');

    // Create a container specifically for the table
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');

    // Create table
    const table = document.createElement('table');
    table.innerHTML = `<tr><th>Grades</th><th>No of Students</th></tr>`;
    // Sort results based on the predefined grade order
    results.sort((a, b) => {
        const indexA = gradeOrder.indexOf(a.Grade);
        const indexB = gradeOrder.indexOf(b.Grade);
        return indexA - indexB; // Sort based on index in the gradeOrder array
    });
    results.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item.Grade}</td><td>${item.Count}</td>`;
        table.appendChild(row);
    });
    tableContainer.appendChild(table);  // Append table to its container

    // Create a container specifically for the pie chart
    const pieChartContainer = document.createElement('div');
    pieChartContainer.classList.add('pie-chart-container');

    // Create pie chart canvas
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = 'gradeChart';
    pieChartContainer.appendChild(chartCanvas);  // Append chart to its container

    // Add both containers to results-content
    resultsContent.appendChild(tableContainer);
    resultsContent.appendChild(pieChartContainer);

    // Display pie chart with Chart.js
    const ctx = chartCanvas.getContext('2d');
    if (window.gradeChart instanceof Chart) {
        window.gradeChart.destroy();  // Only destroy if a valid Chart instance exists
    }

    window.gradeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: results.map(item => item.Grade),
            datasets: [{
                data: results.map(item => item.Count),
                backgroundColor: results.map(item => colorMapping[item.Grade] || '#CCCCCC') // Use colorMapping
            }]
        }
    });
}
