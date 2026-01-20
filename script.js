let scheduleData = JSON.parse(localStorage.getItem("scheduleData")) || { settings: {}, courses: [], classes: [] };
let currentDate = new Date();

// ----------------- Tabs -----------------
function showSection(id) {
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelector(`nav button[onclick="showSection('${id}')"]`).classList.add("active");
  document.getElementById(id).classList.add("active");
}

function saveData() { localStorage.setItem("scheduleData", JSON.stringify(scheduleData)); }

function renderAll() {
  renderWorkflowView();
  renderCoursesView();
  updateCourseDropdown();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  renderCalendar();
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);
  document.getElementById("theme-select").value = savedTheme;
});

// ----------------- Theme Toggle -----------------
function toggleTheme() {
  const theme = document.getElementById("theme-select").value;
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// ----------------- Workflow -----------------
function renderWorkflowView() {
  const c = document.getElementById("daily-schedule-container");
  c.innerHTML = "";
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  days.forEach(day => {
    const section = document.createElement("div");
    const isToday = day === today;
    section.className = `day-section ${isToday ? "current-day" : ""}`;
    section.innerHTML = `<div class="day-heading">${day}${isToday ? '<span class="current-day-indicator">Today</span>' : ''}</div>`;
    const classes = scheduleData.classes.filter(c => c.day === day);
    if (classes.length) {
      classes.forEach(cls => {
        section.innerHTML += `<div class="class-item"><strong>${cls.course}</strong><span>${cls.type}</span><span>${cls.time}</span><span>${cls.location}</span></div>`;
      });
    } else {
      section.innerHTML += `<div class="class-item" style="opacity:0.6;">No classes scheduled</div>`;
    }
    c.appendChild(section);
  });
}

function renderCoursesView() {
  const c = document.getElementById("courses-container");
  c.innerHTML = "";
  if (!scheduleData.courses.length) {
    c.innerHTML = `<div class="empty-state"><h3>No Courses Added</h3></div>`;
    return;
  }
  scheduleData.courses.forEach(x => {
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `<button class="delete-course" onclick="deleteCourse('${x.code}')">&times;</button>
      <h3>${x.code}</h3><p>${x.name}</p>`;
    c.appendChild(card);
  });
}

function updateCourseDropdown() {
  const s = document.getElementById("class-course");
  s.innerHTML = '<option value="">Select a course</option>';
  scheduleData.courses.forEach(x => {
    const o = document.createElement("option");
    o.value = x.code;
    o.textContent = `${x.code} - ${x.name}`;
    s.appendChild(o);
  });
}

// ----------------- Add/Delete -----------------
function addNewClass() {
  const cls = {
    id: Date.now().toString(),
    day: document.getElementById("class-day").value,
    course: document.getElementById("class-course").value,
    type: document.getElementById("class-type").value,
    time: document.getElementById("class-time").value,
    location: document.getElementById("class-location").value,
  };
  scheduleData.classes.push(cls); saveData(); closeModal("add-class-modal"); renderAll();
}

function addNewCourse() {
  const c = { code: document.getElementById("course-code").value.trim(), name: document.getElementById("course-name").value.trim() };
  scheduleData.courses.push(c); saveData(); closeModal("add-course-modal"); renderAll();
}

function deleteClass(id) { scheduleData.classes = scheduleData.classes.filter(c => c.id !== id); saveData(); renderAll(); }
function deleteCourse(code) {
  // Automatically delete all classes (timings) associated with this course
  scheduleData.classes = scheduleData.classes.filter(c => c.course !== code);
  // Delete the course itself
  scheduleData.courses = scheduleData.courses.filter(c => c.code !== code);
  saveData();
  renderAll();
}

function saveSettings() {
  scheduleData.settings = {
    name: document.getElementById("student-name").value,
    studentId: document.getElementById("student-id").value,
    term: document.getElementById("academic-term").value
  };
  saveData(); alert("Settings saved!");
}

function openAddClassModal(){document.getElementById("add-class-modal").classList.add("active");}
function openAddCourseModal(){document.getElementById("add-course-modal").classList.add("active");}
function closeModal(id){document.getElementById(id).classList.remove("active");}

// ----------------- Import/Export -----------------
function exportData() {
  const data = JSON.stringify(scheduleData, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "class-schedule.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData() { document.getElementById("import-modal").classList.add("active"); }

function importDataFromText() {
  try {
    const txt = document.getElementById("import-data").value;
    const parsed = JSON.parse(txt);
    if (!parsed.settings || !parsed.courses || !parsed.classes) { alert("Invalid JSON structure!"); return; }
    scheduleData = parsed; saveData(); closeModal("import-modal"); renderAll();
  } catch(e){ alert("Invalid JSON!"); }
}

function clearAllData() {
  if(confirm("Clear all data?")) {
    localStorage.removeItem("scheduleData");
    scheduleData = { settings: {}, courses: [], classes: [] };
    renderAll();
  }
}

// ----------------- Calendar -----------------
const mqEvents = [
  {"date":"2025-01-01","name":"Recess End","session":"Session 3"},
  {"date":"2025-01-02","name":"Session classes resume","session":"Session 3"},
  {"date":"2025-01-19","name":"Last Day of Classes","session":"Session 3"},
  {"date":"2025-01-20","name":"Exams Start","session":"Session 3"},
  {"date":"2025-01-24","name":"Study Period End","session":"Session 3"},
  {"date":"2025-01-24","name":"Exams End","session":"Session 3"},
  {"date":"2025-02-06","name":"Result Publication Date","session":"Session 3"},
  {"date":"2025-02-10","name":"Supplementary Exams start","session":"Session 3"},
  {"date":"2025-02-13","name":"Supplementary Exams end","session":"Session 3"},
  {"date":"2025-02-21","name":"Payment Due Date","session":"Session 1"},
  {"date":"2025-02-21","name":"Payment Due Date","session":"Full Year"},
  {"date":"2025-02-24","name":"Study Period Start","session":"Session 1"},
  {"date":"2025-02-24","name":"Study Period Start","session":"Full Year"},
  {"date":"2025-03-09","name":"Last Enrol Date via eStudent","session":"Session 1"},
  {"date":"2025-03-09","name":"Last Enrol Date via eStudent","session":"Full Year"},
  {"date":"2025-03-21","name":"Teaching Census","session":"Session 1"},
  {"date":"2025-04-14","name":"Recess Start","session":"Session 1"},
  {"date":"2025-04-21","name":"Teaching Census","session":"Full Year"},
  {"date":"2025-04-25","name":"Recess End","session":"Session 1"},
  {"date":"2025-04-28","name":"Last Withdrawal","session":"Session 1"},
  {"date":"2025-04-28","name":"Last Withdraw Date via eStudent","session":"Session 1"},
  {"date":"2025-04-28","name":"Last Withdrawal Without Fail","session":"Session 1"},
  {"date":"2025-04-28","name":"Session classes resume","session":"Session 1"},
  {"date":"2025-05-28","name":"Last Withdrawal","session":"Full Year"},
  {"date":"2025-05-28","name":"Last Withdraw Date via eStudent","session":"Full Year"},
  {"date":"2025-05-28","name":"Last Withdrawal Without Fail","session":"Full Year"},
  {"date":"2025-05-30","name":"Last Day of Classes","session":"Full Year 2"},
  {"date":"2025-06-02","name":"Exams Start","session":"Full Year 2"},
  {"date":"2025-06-08","name":"Last Day of Classes","session":"Session 1"},
  {"date":"2025-06-10","name":"Exams Start","session":"Session 1"},
  {"date":"2025-06-20","name":"Study Period End","session":"Full Year 2"},
  {"date":"2025-06-20","name":"Exams End","session":"Full Year 2"},
  {"date":"2025-06-23","name":"Study Period Start","session":"Winter Vacation"},
  {"date":"2025-06-27","name":"Exams End","session":"Session 1"},
  {"date":"2025-06-27","name":"Study Period End","session":"Session 1"},
  {"date":"2025-06-30","name":"Last Enrol Date via eStudent","session":"Winter Vacation"},
  {"date":"2025-06-30","name":"Session break commences","session":"OUA Session 1"},
  {"date":"2025-06-30","name":"Session break commences","session":"Session 1"},
  {"date":"2025-07-01","name":"Teaching Census","session":"Winter Vacation"},
  {"date":"2025-07-03","name":"Result Publication Date","session":"Full Year 2"},
  {"date":"2025-07-08","name":"Last Withdrawal","session":"Winter Vacation"},
  {"date":"2025-07-08","name":"Last Withdraw Date via eStudent","session":"Winter Vacation"},
  {"date":"2025-07-08","name":"Last Withdrawal Without Fail","session":"Winter Vacation"},
  {"date":"2025-07-10","name":"Result Publication Date","session":"Session 1"},
  {"date":"2025-07-10","name":"Supplementary Exams Start","session":"Session 1"},
  {"date":"2025-07-22","name":"Supplementary Exams End","session":"Session 1"},
  {"date":"2025-07-25","name":"Payment Due Date","session":"Session 2"},
  {"date":"2025-07-25","name":"Payment Due Date","session":"Full Year 2"},
  {"date":"2025-07-28","name":"Study Period Start","session":"Session 2"},
  {"date":"2025-07-28","name":"Study Period Start","session":"Full Year 2"},
  {"date":"2025-07-30","name":"Study Period End","session":"Winter Vacation"},
  {"date":"2025-08-06","name":"Result Publication Date","session":"Winter Vacation"},
  {"date":"2025-08-10","name":"Last Enrol Date via eStudent","session":"Session 2"},
  {"date":"2025-08-10","name":"Last Enrol Date via eStudent","session":"Full Year 2"},
  {"date":"2025-08-22","name":"Teaching Census","session":"Session 2"},
  {"date":"2025-09-22","name":"Recess Start","session":"Session 2"},
  {"date":"2025-09-28","name":"Last Withdrawal","session":"Session 2"},
  {"date":"2025-09-28","name":"Last Withdraw Date via eStudent","session":"Session 2"},
  {"date":"2025-09-28","name":"Last Withdrawal Without Fail","session":"Session 2"},
  {"date":"2025-10-03","name":"Teaching Census","session":"Full Year 2"},
  {"date":"2025-10-06","name":"Recess End","session":"Session 2"},
  {"date":"2025-10-07","name":"Session classes resume","session":"Session 2"},
  {"date":"2025-11-09","name":"Last Day of Classes","session":"Session 2"},
  {"date":"2025-11-09","name":"Last Day of Classes","session":"Full Year"},
  {"date":"2025-11-10","name":"Exams Start","session":"Session 2"},
  {"date":"2025-11-10","name":"Exams Start","session":"Full Year"},
  {"date":"2025-11-28","name":"Exams End","session":"Session 2"},
  {"date":"2025-11-28","name":"Study Period End","session":"Session 2"},
  {"date":"2025-11-28","name":"Last Withdrawal","session":"Full Year 2"},
  {"date":"2025-11-28","name":"Last Withdraw Date via eStudent","session":"Full Year 2"},
  {"date":"2025-11-28","name":"Last Withdrawal Without Fail","session":"Full Year 2"},
  {"date":"2025-11-28","name":"Exams End","session":"Full Year"},
  {"date":"2025-11-28","name":"Study Period End","session":"Full Year"},
  {"date":"2025-12-01","name":"Session break commences","session":"Session 2"},
  {"date":"2025-12-11","name":"Result Publication Date","session":"Session 2"},
  {"date":"2025-12-11","name":"Supplementary Exams Start","session":"Session 2"},
  {"date":"2025-12-11","name":"Result Publication Date","session":"Full Year"},
  {"date":"2025-12-12","name":"Payment Due Date","session":"Session 3"},
  {"date":"2025-12-15","name":"Study Period Start","session":"Session 3"},
  {"date":"2025-12-21","name":"Last Enrol Date via eStudent","session":"Session 3"},
  {"date":"2025-12-23","name":"Supplementary Exams End","session":"Session 2"},
  {"date":"2025-12-25","name":"Recess Start","session":"Session 3"},
  {"date":"2025-12-29","name":"Teaching Census","session":"Session 3"}
];

function goToToday() {
  currentDate = new Date();
  renderCalendar();
  const todayBtn = document.querySelector('.btn-today');
  todayBtn.classList.add('fade');
  setTimeout(() => todayBtn.classList.remove('fade'), 500);
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

function renderCalendar() {
  const container = document.getElementById('calendar-container');
  const details = document.getElementById('event-details');
  const monthYearDisplay = document.getElementById('calendar-month-year');
  container.innerHTML = '';
  details.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const dayToday = isCurrentMonth ? today.getDate() : null;

  // Display month and year
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

  // Add day headers
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day';
    dayHeader.style.fontWeight = 'bold';
    dayHeader.textContent = day;
    container.appendChild(dayHeader);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Empty cells for first day alignment
  for (let i = 0; i < firstDay; i++) {
    container.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= lastDate; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    if (d === dayToday && isCurrentMonth) {
      cell.classList.add('today');
    }
    cell.textContent = d;

    // Check for events
    const dateString = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const events = mqEvents.filter(e => e.date === dateString);
    if (events.length) {
      const dot = document.createElement('div');
      dot.className = 'event-dot';
      cell.appendChild(dot);

      cell.addEventListener('click', () => {
        details.innerHTML = events.map(ev => `<strong>${ev.name}</strong> (${ev.session})`).join('<br>');
      });
    }

    container.appendChild(cell);
  }
}