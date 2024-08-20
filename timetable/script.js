// script.js
const subjects = {};
const colors = ["#FFA07A", "#20B2AA", "#778899", "#DDA0DD", "#90EE90", "#87CEFA"];
let currentColorIndex = 0;
const timetables = {};
const quotes = [
    "The only way to do great work is to love what you do. – Steve Jobs",
    "Success is not how high you have climbed, but how you make a positive difference to the world. – Roy T. Bennett",
    "Your time is limited, don’t waste it living someone else’s life. – Steve Jobs",
    "The best way to predict the future is to invent it. – Alan Kay",
    "Life is 10% what happens to us and 90% how we react to it. – Charles R. Swindoll"
];

function createTimetable(semester) {
    const timetable = document.getElementById("timetable");
    timetable.innerHTML = ''; // Clear previous timetable if any
    const days = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    // Create header row
    days.forEach(day => {
        const cell = document.createElement("div");
        cell.className = "cell header";
        cell.textContent = day;
        timetable.appendChild(cell);
    });

    // Create timetable cells
    for (let i = 0; i < periods.length; i++) {
        for (let j = 0; j < days.length; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            if (j === 0) {
                cell.classList.add("header");
                cell.textContent = periods[i];
            } else {
                cell.dataset.period = periods[i];
                cell.dataset.day = days[j];
                cell.onclick = assignSubject;
            }
            timetable.appendChild(cell);
        }
    }

    // Load saved timetable for the selected semester
    if (timetables[semester]) {
        for (const [key, value] of Object.entries(timetables[semester])) {
            const [day, period] = key.split('-');
            const cell = document.querySelector(`.cell[data-day="${day}"][data-period="${period}"]`);
            if (cell) {
                cell.textContent = value.subject;
                cell.style.backgroundColor = value.color;
            }
        }
    }
}

function assignSubject(event) {
    const subject = document.getElementById("subjectInput").value;
    if (!subject) return alert("Please enter a subject");

    const cell = event.target;
    const key = subject.toLowerCase();
    const day = cell.dataset.day;
    const period = cell.dataset.period;
    const semester = document.getElementById("semesterSelect").value;

    if (!subjects[key]) {
        subjects[key] = colors[currentColorIndex % colors.length];
        currentColorIndex++;
    }

    cell.textContent = subject;
    cell.style.backgroundColor = subjects[key];

    if (!timetables[semester]) {
        timetables[semester] = {};
    }

    timetables[semester][`${day}-${period}`] = { subject, color: subjects[key] };
}

function clearTimetable() {
    const semester = document.getElementById("semesterSelect").value;
    if (timetables[semester]) {
        timetables[semester] = {};
    }

    document.querySelectorAll(".cell").forEach(cell => {
        if (!cell.classList.contains("header")) {
            cell.textContent = "";
            cell.style.backgroundColor = "";
        }
    });
}

function getRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteDisplay.textContent = quotes[randomIndex];
}

document.getElementById("clearButton").onclick = clearTimetable;
document.getElementById("quoteButton").onclick = getRandomQuote;

document.getElementById("semesterSelect").onchange = function() {
    const timetableContainer = document.getElementById("timetableContainer");
    timetableContainer.style.display = "block";
    const semester = this.value;
    createTimetable(semester);
};
