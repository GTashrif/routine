let scheduleData = JSON.parse(localStorage.getItem("scheduleData")) || { settings: {}, courses: [], classes: [] };
let currentDate = new Date();
let editMode = false;

// ────────────────────────────────────────────────
// Tabs / Navigation
// ────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelector(`nav button[onclick="showSection('${id}')"]`).classList.add("active");
  document.getElementById(id).classList.add("active");

  updateFloatingWeekBadge();

  if (id === 'calendar') {
    renderCalendar();
  }
}

function saveData() { 
  localStorage.setItem("scheduleData", JSON.stringify(scheduleData)); 
}

function renderAll() {
  renderWorkflowView();
  renderCoursesView();
  updateCourseDropdown();
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  renderCalendar();
  updateFloatingWeekBadge();
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);
  document.getElementById("theme-select").value = savedTheme;
});

// ────────────────────────────────────────────────
// Theme Toggle
// ────────────────────────────────────────────────
function toggleTheme() {
  const theme = document.getElementById("theme-select").value;
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// ────────────────────────────────────────────────
// Edit Mode Toggle
// ────────────────────────────────────────────────
function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById("edit-toggle-btn");
  if (editMode) {
    btn.textContent = "✅ Done";
    btn.classList.add("btn-edit-active");
    btn.classList.remove("btn-edit-toggle");
  } else {
    btn.textContent = "✏️ Edit";
    btn.classList.remove("btn-edit-active");
    btn.classList.add("btn-edit-toggle");
  }
  renderWorkflowView();
}

// ────────────────────────────────────────────────
// Workflow & Courses Rendering
// ────────────────────────────────────────────────
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
        const item = document.createElement("div");
        item.className = "class-item";
        item.innerHTML = `
          <div class="class-item-info">
            <strong>${cls.course}</strong>
            <span>${cls.type}</span>
            <span>${cls.time}</span>
            <span>${cls.location}</span>
          </div>
          ${editMode ? `
          <div class="class-item-actions">
            <button class="btn-edit-class" onclick="openEditClassModal('${cls.id}')">✏️ Edit</button>
            <button class="btn-delete-class" onclick="deleteClass('${cls.id}')">🗑️ Remove</button>
          </div>` : ''}
        `;
        section.appendChild(item);
      });
    } else {
      section.innerHTML += `<div class="class-item no-class">No classes scheduled</div>`;
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
    card.innerHTML = `<button class="delete-course" onclick="deleteCourse('${x.code}')">×</button>
      <h3>${x.code}</h3><p>${x.name}</p>`;
    c.appendChild(card);
  });
}

function updateCourseDropdown() {
  ["class-course", "edit-class-course"].forEach(id => {
    const s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = '<option value="">Select a course</option>';
    scheduleData.courses.forEach(x => {
      const o = document.createElement("option");
      o.value = x.code;
      o.textContent = `${x.code} - ${x.name}`;
      s.appendChild(o);
    });
  });
}

// ────────────────────────────────────────────────
// Add / Edit / Delete Classes & Courses
// ────────────────────────────────────────────────
function addNewClass() {
  const cls = {
    id: Date.now().toString(),
    day: document.getElementById("class-day").value,
    course: document.getElementById("class-course").value,
    type: document.getElementById("class-type").value,
    time: document.getElementById("class-time").value,
    location: document.getElementById("class-location").value,
  };
  if (!cls.course) {
    alert("Please select a course");
    return;
  }
  scheduleData.classes.push(cls); 
  saveData(); 
  closeModal("add-class-modal"); 
  renderAll();
}

function openEditClassModal(id) {
  const cls = scheduleData.classes.find(c => c.id === id);
  if (!cls) return;
  updateCourseDropdown();
  document.getElementById("edit-class-id").value = cls.id;
  document.getElementById("edit-class-day").value = cls.day;
  document.getElementById("edit-class-course").value = cls.course;
  document.getElementById("edit-class-type").value = cls.type;
  document.getElementById("edit-class-time").value = cls.time;
  document.getElementById("edit-class-location").value = cls.location;
  document.getElementById("edit-class-modal").classList.add("active");
}

function saveEditedClass() {
  const id = document.getElementById("edit-class-id").value;
  const idx = scheduleData.classes.findIndex(c => c.id === id);
  if (idx === -1) return;
  if (!document.getElementById("edit-class-course").value) {
    alert("Please select a course");
    return;
  }
  scheduleData.classes[idx] = {
    id,
    day: document.getElementById("edit-class-day").value,
    course: document.getElementById("edit-class-course").value,
    type: document.getElementById("edit-class-type").value,
    time: document.getElementById("edit-class-time").value,
    location: document.getElementById("edit-class-location").value,
  };
  saveData(); 
  closeModal("edit-class-modal"); 
  renderWorkflowView();
}

function addNewCourse() {
  const code = document.getElementById("course-code").value.trim();
  const name = document.getElementById("course-name").value.trim();
  if (!code || !name) {
    alert("Please enter both course code and name");
    return;
  }
  const c = { code, name };
  scheduleData.courses.push(c); 
  saveData(); 
  closeModal("add-course-modal"); 
  renderAll();
}

function deleteClass(id) { 
  scheduleData.classes = scheduleData.classes.filter(c => c.id !== id); 
  saveData(); 
  renderWorkflowView(); 
}

function deleteCourse(code) {
  scheduleData.classes = scheduleData.classes.filter(c => c.course !== code);
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
  saveData(); 
  alert("Settings saved!");
}

function openAddClassModal(){document.getElementById("add-class-modal").classList.add("active");}
function openAddCourseModal(){document.getElementById("add-course-modal").classList.add("active");}
function closeModal(id){document.getElementById(id).classList.remove("active");}

// ────────────────────────────────────────────────
// Import / Export / Clear Data
// ────────────────────────────────────────────────
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
    if (!parsed.settings || !parsed.courses || !parsed.classes) { 
      alert("Invalid JSON structure!"); 
      return; 
    }
    scheduleData = parsed; 
    saveData(); 
    closeModal("import-modal"); 
    renderAll();
  } catch(e){
    alert("Invalid JSON!");
  }
}

function clearAllData() {
  if(confirm("Clear all data?")) {
    localStorage.removeItem("scheduleData");
    scheduleData = { settings: {}, courses: [], classes: [] };
    editMode = false;
    const btn = document.getElementById("edit-toggle-btn");
    btn.textContent = "✏️ Edit";
    btn.classList.remove("btn-edit-active");
    btn.classList.add("btn-edit-toggle");
    renderAll();
  }
}

// ────────────────────────────────────────────────
// Calendar & Floating Badge Logic
// ────────────────────────────────────────────────
const mqEvents = [
  { date: "2026-02-23", name: "Session 1 Start", session: "Session 1", isSessionStart: true },
  { date: "2026-07-27", name: "Session 2 Start", session: "Session 2", isSessionStart: true },
  { date: "2026-12-14", name: "Session 3 Start", session: "Session 3", isSessionStart: true },

  {"date":"2026-02-16","name":"Kickstart","session":"Session 1"},
  {"date":"2026-03-08","name":"Last Enrol Date via eStudent","session":"Session 1"},
  {"date":"2026-03-20","name":"Teaching Census","session":"Session 1"},
  {"date":"2026-04-06","name":"Recess Start","session":"Session 1"},
  {"date":"2026-04-19","name":"Recess End","session":"Session 1"},
  {"date":"2026-04-20","name":"Session classes resume","session":"Session 1"},
  {"date":"2026-04-28","name":"Last Withdrawal Without Fail","session":"Session 1"},
  {"date":"2026-06-07","name":"Last Day of Classes","session":"Session 1"},
  {"date":"2026-06-09","name":"Exams Start","session":"Session 1"},
  {"date":"2026-06-26","name":"Exams End","session":"Session 1"},
  {"date":"2026-07-09","name":"Result Publication Date","session":"Session 1"},
  // Add more dates for Session 2 and 3 if desired
];

function goToToday() {
  currentDate = new Date();
  renderCalendar();
  updateFloatingWeekBadge();
  const todayBtn = document.querySelector('.btn-today');
  todayBtn.classList.add('fade');
  setTimeout(() => todayBtn.classList.remove('fade'), 500);
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
  updateFloatingWeekBadge();
}

function getCurrentTeachingWeek(targetDate) {
  const sessionStarts = mqEvents.filter(e => e.isSessionStart);
  sessionStarts.sort((a, b) => new Date(a.date) - new Date(b.date));

  let activeSession = null;

  for (const start of sessionStarts) {
    const startDate = new Date(start.date);
    if (targetDate >= startDate) {
      activeSession = start;
    } else {
      break;
    }
  }

  if (!activeSession) {
    return { status: "No current session" };
  }

  const startDate = new Date(activeSession.date);
  const diffTime = targetDate - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const week = Math.floor(diffDays / 7) + 1;

  // Rough cutoff after ~20 weeks (covers teaching + exam period)
  console.log(`Current Session: ${activeSession.session}, Week: ${week}`);
  if (week > 20) {
    return { status: "No current session" };
  }

  return {
    status: "active",
    session: activeSession.session.replace("Session ", ""), // "1", "2", "3"
    week
  };
}

function updateFloatingWeekBadge() {
  const badge = document.getElementById('floating-week-badge');
  if (!badge) return;

  const info = getCurrentTeachingWeek(currentDate);

  if (info.status === "No current session") {
    badge.querySelector('.session').textContent = "";
    badge.querySelector('.week-num').textContent = "No current session";
  } else {
    badge.querySelector('.session').textContent = `Session ${info.session}`;
    badge.querySelector('.week-num').textContent = `Week ${info.week}`;
  }

  badge.classList.add('visible');
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

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

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

  updateFloatingWeekBadge();
}
