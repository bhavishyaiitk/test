let allCourses = []; // To store all courses fetched from the server
let visibleCoursesCount = 10; // Number of courses to show initially

// Show or hide the sections based on button clicks
const colorMapping = {
    'A*': '#00FFFF', // Cyan
    'A': '#006400',  // Dark Green
    'B+': '#228B22', // Green
    'B': '#32CD32',  // Lime Green
    'C+': '#b1cf2d', // Yellow
    'C': '#FFFF00',  // Yellow
    'D+': '#e6983f', // Light Yellow
    'D': '#FF6347',  // Tomatono
    'E': '#699791',
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
            


                <div id="yearSelection" style="display: none;">
                    
                        <div id="selectCourseBox">Select a Year</div>
                        <div id="yearList" style="display: none;"></div> <!-- Added yearList div -->
                    
                </div>

            
                <div id="semesterSelection" style="display: none;">
                    
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

// Function to show the Compare Grading section with separate elements for left and right
function showCompareGrading() {
    document.body.innerHTML = `
    
        <div id="compareGradingSection">
            <div id="homepageButtonContainer">
                <button id="homepageButton" onclick="goToHomepage()">Homepage</button>
            </div>

            <div class="left-align-wrapper">
                <div id="selectCourseBox">Select 1st Course here</div>
                <input type="text" id="courseInputLeft" placeholder="Type course name">
                <div id="suggestionsLeft" style="display: none;"></div>

                <div id="yearSelectionLeft" style="display: none;">
                    <div id="selectCourseBox">Select a Year</div>
                    <div id="yearListLeft" style="display: none;"></div> <!-- Added yearList div -->
                </div>

                <div id="semesterSelectionLeft" style="display: none;">
                    <div id="selectCourseBox">Select Semester:</div>
                    <div id="semesterListLeft"></div>
                </div>

                <!-- Added grades box below the selections -->
                <div id="gradesBoxLeft" style="display: none;">
                    
                    <h3>Grades for 1st Course</h3>
                 


                    <div id="gradesTableLeft"></div>
                    <div id="gradeChartLeft" class="chart-box"></div>
                </div>
            </div>

            <div class="right-align-wrapper">
                <div id="selectCourseBox">Select 2nd Course here</div>
                <input type="text" id="courseInputRight" placeholder="Type course name">
                <div id="suggestionsRight" style="display: none;"></div>

                <div id="yearSelectionRight" style="display: none;">
                    <div id="selectCourseBox">Select a Year</div>
                    <div id="yearListRight" style="display: none;"></div> <!-- Added yearList div -->
                </div>

                <div id="semesterSelectionRight" style="display: none;">
                    <div id="selectCourseBox">Select Semester:</div>
                    <div id="semesterListRight"></div>
                </div>

                <!-- Added grades box below the selections -->
                <div id="gradesBoxRight" style="display: none;">
                
                    <h3>Grades for 2nd Course</h3>
                  
                    <div id="gradesTableRight"></div>
                    <div id="gradeChartRight" class="chart-box"></div>
                </div>
            </div>
        </div>
        
        
    `;

    // Attach event listeners for both input fields
    document.getElementById('courseInputLeft').addEventListener('input', () => afetchSuggestions('Left'));
    document.getElementById('courseInputRight').addEventListener('input', () => afetchSuggestions('Right'));
}

// Fetch course suggestions based on input, with section (Left or Right)
async function afetchSuggestions(side) {
    const query = document.getElementById(`courseInput${side}`).value;
    const suggestionsBox = document.getElementById(`suggestions${side}`);
    suggestionsBox.innerHTML = '';

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
                document.getElementById(`courseInput${side}`).value = course;
                suggestionsBox.innerHTML = '';
                await afetchYears(course, side);
            };
            suggestionsBox.appendChild(div);
            count++;

            if (count === visibleCoursesCount) break;
        }

        if (count === visibleCoursesCount) {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.textContent = `+ ${suggestions.length - visibleCoursesCount} more courses`;
            div.onclick = () => ashowAllCourses(query, side);
            suggestionsBox.appendChild(div);
        }

        suggestionsBox.style.display = 'block';
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        suggestionsBox.innerHTML = `<p>Error fetching suggestions. Please try again.</p>`;
        suggestionsBox.style.display = 'block';
    }
}

// Show all related courses for "+ more courses" option, with side-specific ID
async function ashowAllCourses(query, side) {
    const suggestionsBox = document.getElementById(`suggestions${side}`);
    suggestionsBox.innerHTML = '';
    

    const response = await fetch(`/suggest?query=${query}`);
    const suggestions = await response.json();

    suggestions.forEach(course => {
        const div = document.createElement('div');
        div.classList.add('suggestion-item');
        div.textContent = course;
        div.onclick = () => {
            document.getElementById(`courseInput${side}`).value = course;
            suggestionsBox.innerHTML = '';
            afetchYears(course, side);
        };
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = 'block';
}


let selectedYear = {};  // Store the currently selected year per side

async function afetchYears(courseName, side) {
    const response = await fetch(`/get_years?course_name=${courseName}`);
    const years = await response.json();

    years.sort((a, b) => {
        const yearA = parseInt(a.split('-')[0]);
        const yearB = parseInt(b.split('-')[0]);
        return yearB - yearA;
    });

    const yearSelection = document.getElementById(`yearSelection${side}`);
    const yearList = document.getElementById(`yearList${side}`);
    
    // Check if we're in "collapsed" mode (only selected year shown)
    if (yearList.dataset.collapsed === 'true') {
        // Repopulate and show all years
        yearList.innerHTML = '';
        years.forEach(year => {
            const div = document.createElement('div');
            div.classList.add('year-item');
            div.textContent = year;
            div.onclick = () => handleYearClick(courseName, year, side);
            yearList.appendChild(div);
        });

        // Show full list with scrolling enabled
        yearList.style.overflowY = 'auto';
        yearList.style.maxHeight = '200px';
        yearList.dataset.collapsed = 'false';  // Mark as expanded
    } else {
        // Populate the list the first time
        yearList.innerHTML = '';
        years.forEach(year => {
            const div = document.createElement('div');
            div.classList.add('year-item');
            div.textContent = year;
            div.onclick = () => handleYearClick(courseName, year, side);
            yearList.appendChild(div);
        });

        // Show full list with scrolling enabled
        yearList.style.overflowY = 'auto';
        yearList.style.maxHeight = '200px';
        yearList.dataset.collapsed = 'false';  // Set to expanded on initial load
    }

    yearSelection.style.display = 'block';
    yearList.style.display = 'block';
}

function handleYearClick(courseName, year, side) {
    selectedYear[side] = year;  // Save selected year
    afetchSemesters(courseName, year, side);  // Fetch semesters

    const yearList = document.getElementById(`yearList${side}`);
    yearList.innerHTML = '';

    // Collapse to show only selected year
    const selectedDiv = document.createElement('div');
    selectedDiv.classList.add('year-item');
    selectedDiv.textContent = year;
    selectedDiv.onclick = () => afetchYears(courseName, side);  // Click to expand
    yearList.appendChild(selectedDiv);

    // Update state and styles to indicate collapse
    yearList.dataset.collapsed = 'true';
    yearList.style.overflowY = 'hidden';
    yearList.style.maxHeight = 'auto';
}

// Fetch semesters for course, year, and side (Left or Right)
async function afetchSemesters(courseName, year, side) {
    const response = await fetch(`/get_semesters?course_name=${courseName}&year=${year}`);
    const semesters = await response.json();

    const semesterSelection = document.getElementById(`semesterSelection${side}`);
    const semesterList = document.getElementById(`semesterList${side}`);
    
    // Show the semester selection box
    semesterSelection.style.display = 'block';
    semesterList.innerHTML = ''; // Clear previous semester list

    if (semesters.length === 1) {
        // If only one semester, fetch grades immediately and hide the semester box
        afetchGrades(courseName, year, semesters[0], side);
        semesterSelection.style.display = 'none'; // Hide semester selection box
        semesterList.style.display = 'none'; // Hide semester list
    } else {
        // If multiple semesters, create the list and allow selection
        semesters.forEach(semester => {
            const div = document.createElement('div');
            div.classList.add('semester-item');
            div.textContent = semester;
            div.onclick = () => {
                // Fetch grades for the selected semester
                afetchGrades(courseName, year, semester, side);

                // Hide semester selection box and semester list after selecting
                semesterSelection.style.display = 'none';
                semesterList.style.display = 'none';
            };
            semesterList.appendChild(div);
        });

        semesterList.style.display = 'block'; // Show the semester list
    }
}

// Fetch grades based on course, year, semester, and side (Left or Right)
const gradeOrder = ['A*', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F', 'S', 'X'];
async function afetchGrades(courseName, year, semester, side) {
    // Clear old grade distribution data (table and charts)
    const tableContainerId = `gradesTable${side}`;
    const chartContainerId = `gradeChart${side}`;
    const histogramContainerId = `gradeHistogram${side}`;
    const resultsContainerId = `gradesBox${side}`;

    let resultsBox = document.getElementById(resultsContainerId);
    resultsBox.style.display = 'block'; // Make it visible once grades are fetched
    
    // Clear the previous table content
    let table = document.getElementById(tableContainerId);
    table.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <th style="border: 1px solid #ddd;background-color: green; color: black; padding: 8px;text-align: center;">Grade</th>
                <th style="border: 1px solid #ddd;background-color: green; color: black; padding: 8px;text-align: center;">Count</th>
                <th style="border: 1px solid #ddd;background-color: green; color: black; padding: 8px;text-align: center;">% of Students</th>
            </tr>
        </table>
        
    `;

    // Remove the previous pie chart canvas
    let existingPieCanvas = document.getElementById(chartContainerId);
    if (existingPieCanvas) {
        existingPieCanvas.remove();  // Remove the previous canvas
    }

    // Remove the previous histogram canvas
    let existingHistogramCanvas = document.getElementById(histogramContainerId);
    if (existingHistogramCanvas) {
        existingHistogramCanvas.remove();  // Remove the previous canvas
    }

    // Fetch the new grades
    const response = await fetch(`/get_grades?course_name=${courseName}&year=${year}&semester=${semester}`);
    const results = await response.json();

    // Sort results based on predefined grade order
    results.sort((a, b) => {
        const indexA = gradeOrder.indexOf(a.Grade);
        const indexB = gradeOrder.indexOf(b.Grade);
        return indexA - indexB; // Sort based on index in the gradeOrder array
    });

    // Calculate the total number of students
    const totalStudents = results.reduce((sum, item) => sum + item.Count, 0);

    // Populate the grades table
    results.forEach(item => {
        const percentage = ((item.Count / totalStudents) * 100).toFixed(2); // Calculate the percentage
        const gradeColor = colorMapping[item.Grade] || '#000000'; // Get color for grade

        // Create a new row and set background color
        const row = document.createElement('tr');
        
        // Apply color to each cell in the row
        const gradeCell = document.createElement('td');
        gradeCell.style.border = "1px solid #ddd";
        gradeCell.style.padding = "8px";
        gradeCell.style.textAlign = "center";
        gradeCell.style.backgroundColor = gradeColor; // Apply color to grade cell
        gradeCell.style.color = 'black'; // Set text color for readability
        gradeCell.textContent = item.Grade;

        const countCell = document.createElement('td');
        countCell.style.border = "1px solid #ddd";
        countCell.style.padding = "8px";
        countCell.style.textAlign = "center";
        countCell.style.backgroundColor = gradeColor; // Apply color to count cell
        countCell.style.color = 'black'; // Set text color for readability
        countCell.textContent = item.Count;

        const percentageCell = document.createElement('td');
        percentageCell.style.border = "1px solid #ddd";
        percentageCell.style.padding = "8px";
        percentageCell.style.textAlign = "center";
        percentageCell.style.backgroundColor = gradeColor; // Apply color to percentage cell
        percentageCell.style.color = 'black'; // Set text color for readability
        percentageCell.textContent = `${percentage}%`;

        // Append cells to the row
        row.appendChild(gradeCell);
        row.appendChild(countCell);
        row.appendChild(percentageCell);

        // Append the row to the table
        table.querySelector('table').appendChild(row);
    });

    // Create a new canvas for the pie chart
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = chartContainerId;
    const ctx = chartCanvas.getContext('2d');
    resultsBox.appendChild(chartCanvas); // Append the canvas to the chart container

    // Destroy any existing pie chart instance to avoid memory leaks
    if (window[`${chartContainerId}`] instanceof Chart) {
        window[`${chartContainerId}`].destroy();
    }

    // Create the pie chart
    window[`${chartContainerId}`] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: results.map(item => item.Grade),
            datasets: [{
                data: results.map(item => item.Count),
                backgroundColor: results.map(item => colorMapping[item.Grade] || '#000000'), // Default to black if no color mapping found
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'black', // Set legend label color to blue (or any color you want)
                        font: {
                            weight: 'bold' // Make the legend labels bold
                        }
                    }
                },
                datalabels: {
                    color: 'black', // Set data label color to white (or any color you want)
                    formatter: (value, context) => {
                        return value; // Show count value in the label
                    },
                    anchor: 'end', // Anchor the label at the end of the segment
                    align: 'end', // Align the label at the end of the segment
                },
            }
        }
    });

    // Create a new canvas for the histogram (bar chart)
    const histogramCanvas = document.createElement('canvas');
    histogramCanvas.id = histogramContainerId;
    const histogramCtx = histogramCanvas.getContext('2d');
    resultsBox.appendChild(histogramCanvas); // Append the canvas to the results container

    // Destroy any existing histogram instance to avoid memory leaks
    if (window[`${histogramContainerId}`] instanceof Chart) {
        window[`${histogramContainerId}`].destroy();
    }

    // Prepare data for the histogram (bar chart)
    const gradeCounts = results.map(item => item.Count);
    const gradeLabels = results.map(item => item.Grade);

    // Create the histogram (bar chart)
    window[`${histogramContainerId}`] = new Chart(histogramCtx, {
        type: 'bar',
        data: {
            labels: gradeLabels,
            datasets: [{
                label: 'Grade Distribution',
                data: gradeCounts,
                backgroundColor: results.map(item => colorMapping[item.Grade] || '#000000'), // Match the colors of the pie chart
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'black',
                        font: {
                            weight: 'bold',
                            size: 14, // Optional: Set a size for the legend font
                            
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black', // Set y-axis tick color
                        font: {
                            weight: 'bold',
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    
                    ticks: {
                        color: 'black', // Set y-axis tick color
                        font: {
                            weight: 'bold',
                        }
                    }
                }
            }
        }
    });
    
}

//
//normal vs compare up and below
//

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

    years.sort((a, b) => parseInt(b.split('-')[0]) - parseInt(a.split('-')[0]));

    const yearSelection = document.getElementById('yearSelection');
    const yearList = document.getElementById('yearList');

    yearSelection.style.display = 'block';
    yearList.innerHTML = ''; // Clear previous years

    // Create the list of years
    years.forEach(year => {
        const div = document.createElement('div');
        div.classList.add('year-item');
        div.textContent = year;
        div.onclick = () => {
            // When a year is clicked, hide the list and show only the selected year
            yearList.innerHTML = ''; // Clear the list
            const selectedYearDiv = document.createElement('div');
            selectedYearDiv.classList.add('year-item');
            selectedYearDiv.textContent = year;
            yearList.appendChild(selectedYearDiv);

            // After selecting the year, fetch semesters
            fetchSemesters(courseName, year);

            // Optionally hide the list once a year is selected
            yearList.style.display = 'none';
            
        };
        yearList.appendChild(div);
    });

    yearList.style.display = 'block'; // Show the year list

    // Toggle the visibility of the year list when 'yearSelection' is clicked
    yearSelection.onclick = () => {
        if (yearList.style.display === 'block') {
            // If it's already visible, hide it
            fetchYears(courseName);
           
        } else {
            // Otherwise, show it
            yearList.style.display = 'block';
            
        }
    };
}


async function fetchSemesters(courseName, year) {
    // Remove existing chart, grade box, histogram, and table if they exist
    const previousResultsBox = document.getElementById('results');
    if (previousResultsBox) {
        previousResultsBox.remove();
    }

    // Destroy previous charts if they exist
    if (window.gradePieChart instanceof Chart) {
        window.gradePieChart.destroy();
    }
    if (window.gradeHistogram instanceof Chart) {
        window.gradeHistogram.destroy();
    }

    // Fetch semester data
    const response = await fetch(`/get_semesters?course_name=${courseName}&year=${year}`);
    const semesters = await response.json();

    const semesterSelection = document.getElementById('semesterSelection');
    const semesterList = document.getElementById('semesterList');
    
    semesterSelection.style.display = 'block'; // Ensure the semester selection section is visible
    semesterList.innerHTML = ''; // Clear previous semesters

    if (semesters.length === 1) {
        // If there's only one semester, fetch grades directly
        fetchGrades(courseName, year, semesters[0]);
        semesterSelection.style.display = 'none'; // Hide semester selection box
        semesterList.style.display = 'none'; // Hide semester list 
    } else {
        // If multiple semesters, show them as options
        semesters.forEach(semester => {
            const div = document.createElement('div');
            div.classList.add('semester-item'); // Match the styling with the year items
            div.textContent = semester;
            div.onclick = () => {
                fetchGrades(courseName, year, semester); // Fetch grades on click
                semesterSelection.style.display = 'none'; // Hide semester selection box
                semesterList.style.display = 'none'; // Hide semester list
            };
            semesterList.appendChild(div);
        });

        // Make sure the semester list is visible after adding options
        semesterList.style.display = 'block';
    }
}


async function fetchGrades(courseName, year, semester) {
    // Clear previous chart and grade table
    const previousResultsBox = document.getElementById('results');
    if (previousResultsBox) {
        previousResultsBox.innerHTML = ''; // Clear previous content
    }

    const response = await fetch(`/get_grades?course_name=${courseName}&year=${year}&semester=${semester}`);
    const results = await response.json();

    // Find the parent container to append results below the year/semester selection
    let resultsBox = document.getElementById('results');
    if (!resultsBox) {
        resultsBox = document.createElement('div');
        resultsBox.id = 'results';
        resultsBox.style.marginTop = '20px'; // Adjust spacing between the sections
        resultsBox.style.padding = '20px';
        resultsBox.style.width = '100%'; // Ensure it spans the available width
        const yearSelection = document.getElementById('yearSelection');
        yearSelection.appendChild(resultsBox); // Append it directly below the year selection
    }

    // Clear previous results
    resultsBox.innerHTML = `
        <div class="box">
            <h2>Grades for ${courseName} - ${year} - ${semester}</h2>
        </div>
        <div class="results-content">
            <!-- Table and Pie chart will go here -->
        </div>
    `;

    // Create a container to hold both the table, pie chart, and histogram
    const resultsContent = document.querySelector('.results-content');

    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');

    // Create table
    const table = document.createElement('table');
    table.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <th style="border: 1px solid #ddd;background-color: green; color: black; padding: 8px;text-align: center;">Grade</th>
                <th style="border: 1px solid #ddd;background-color: green; color: black; padding: 8px;text-align: center;">Count</th>
                <th style="border: 1px solid #ddd;background-color: green; color: black; padding: 8px;text-align: center;">% of Students</th>
            </tr>
        </table>
    `;
    // Calculate total count of students
    const totalCount = results.reduce((acc, item) => acc + item.Count, 0);

    results.sort((a, b) => {
        const indexA = gradeOrder.indexOf(a.Grade);
        const indexB = gradeOrder.indexOf(b.Grade);
        return indexA - indexB;
    });

    results.forEach(item => {
        const percentage = ((item.Count / totalCount) * 100).toFixed(2);
        const gradeColor = colorMapping[item.Grade] ; // Get color for grade

        // Create a new row and set background color
        const row = document.createElement('tr');
        
        // Apply color to each cell in the row
        const gradeCell = document.createElement('td');
        gradeCell.style.border = "1px solid #ddd";
        gradeCell.style.padding = "8px";
        gradeCell.style.textAlign = "center";
        gradeCell.style.backgroundColor = gradeColor; // Apply color to grade cell
        gradeCell.style.color = 'black'; // Set text color for readability
        gradeCell.textContent = item.Grade;
        gradeCell.style.fontWeight = 'bold';

        // For the Count Cell
        const countCell = document.createElement('td');
        countCell.style.border = "1px solid #ddd";
        countCell.style.padding = "8px";
        countCell.style.textAlign = "center";
        countCell.style.backgroundColor = gradeColor; // Apply color to count cell
        countCell.style.color = 'black'; // Set text color for readability
        countCell.style.fontWeight = 'bold'; // Make the text bold
        countCell.textContent = item.Count;

        // For the Percentage Cell
        const percentageCell = document.createElement('td');
        percentageCell.style.border = "1px solid #ddd";
        percentageCell.style.padding = "8px";
        percentageCell.style.textAlign = "center";
        percentageCell.style.backgroundColor = gradeColor; // Apply color to percentage cell
        percentageCell.style.color = 'black'; // Set text color for readability
        percentageCell.style.fontWeight = 'bold'; // Make the text bold
        percentageCell.textContent = `${percentage}%`;


        // Append cells to the row
        row.appendChild(gradeCell);
        row.appendChild(countCell);
        row.appendChild(percentageCell);

        table.appendChild(row);
    });

    tableContainer.appendChild(table);

    // Create pie chart container
    const pieChartContainer = document.createElement('div');
    pieChartContainer.classList.add('pie-chart-container');

    // Create pie chart canvas
    const pieChartCanvas = document.createElement('canvas');
    pieChartCanvas.id = 'gradePieChart';
    pieChartContainer.appendChild(pieChartCanvas);

    // Create histogram container
    const histogramContainer = document.createElement('div');
    histogramContainer.classList.add('histogram-container');

    // Create histogram canvas
    const histogramCanvas = document.createElement('canvas');
    histogramCanvas.id = 'gradeHistogram';
    histogramContainer.appendChild(histogramCanvas);

    // Add both containers to results-content
    resultsContent.appendChild(tableContainer);
    resultsContent.appendChild(pieChartContainer);
    resultsContent.appendChild(histogramContainer);

    // Display pie chart with Chart.js
    const pieCtx = pieChartCanvas.getContext('2d');
    if (window.gradePieChart instanceof Chart) {
        window.gradePieChart.destroy();  // Destroy previous pie chart if exists
    }

    window.gradePieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: results.map(item => item.Grade),
            datasets: [{
                data: results.map(item => item.Count),
                backgroundColor: results.map(item => colorMapping[item.Grade] || '#CCCCCC')
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'black', // Set legend label color to blue (or any color you want)
                        font: {
                            weight: 'bold' // Make the legend labels bold
                        }
                    }
                },
                datalabels: {
                    color: 'black', // Set data label color to white (or any color you want)
                    formatter: (value, context) => {
                        return value; // Show count value in the label
                    },
                    anchor: 'end', // Anchor the label at the end of the segment
                    align: 'end', // Align the label at the end of the segment
                },
            }
        }
    });

    // Display histogram with Chart.js (bar chart)
    const histogramCtx = histogramCanvas.getContext('2d');
    if (window.gradeHistogram instanceof Chart) {
        window.gradeHistogram.destroy();  // Destroy previous histogram if exists
    }

    window.gradeHistogram = new Chart(histogramCtx, {
        type: 'bar',
        data: {
            labels: results.map(item => item.Grade),
            datasets: [{
                label: 'No of Students',
                data: results.map(item => item.Count),
                backgroundColor: results.map(item => colorMapping[item.Grade] || '#CCCCCC')
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'black',
                        font: {
                            weight: 'bold',
                            size: 14, // Optional: Set a size for the legend font
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black', // Set y-axis tick color
                        font: {
                            weight: 'bold',
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black', // Set y-axis tick color
                        font: {
                            weight: 'bold',
                        }
                    }
                }
            }
        }
    });
}





