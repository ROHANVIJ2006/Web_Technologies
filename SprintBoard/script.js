/* =========================
   GLOBAL STATE
========================= */
const STORAGE_KEY = "sprint_tasks_v1";
let tasks = [];
let editingTaskId = null;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  renderBoard();
  setupEventListeners();
});

/* =========================
   STORAGE
========================= */
function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  tasks = data ? JSON.parse(data) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* =========================
   UTILITIES
========================= */
function generateId() {
  return Date.now() + "_" + Math.random().toString(36).substr(2, 5);
}

function normalizeTags(tagString) {
  if (!tagString) return [];

  const cleaned = tagString
    .split(",")
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  return [...new Set(cleaned)].slice(0, 5);
}

function isDuplicate(title, dueDate, ignoreId = null) {
  return tasks.some(t =>
    t.title.toLowerCase() === title.toLowerCase() &&
    t.dueDate === dueDate &&
    t.id !== ignoreId
  );
}

/* =========================
   VALIDATION
========================= */
function validateTask(title, dueDate, description) {
  if (title.length < 5 || title.length > 60) {
    alert("Title must be 5–60 characters.");
    return false;
  }

  if (description.length > 150) {
    alert("Description max 150 characters.");
    return false;
  }

  const today = new Date().toISOString().split("T")[0];
  if (dueDate < today) {
    alert("Due date cannot be in the past.");
    return false;
  }

  if (isDuplicate(title, dueDate, editingTaskId)) {
    alert("Task with same title and due date already exists.");
    return false;
  }

  return true;
}

/* =========================
   ADD / EDIT TASK
========================= */
function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;
  const tagsInput = document.getElementById("tags").value;

  if (!validateTask(title, dueDate, description)) return;

  const normalizedTags = normalizeTags(tagsInput);

  if (editingTaskId) {
    const task = tasks.find(t => t.id === editingTaskId);
    task.title = title;
    task.description = description;
    task.priority = priority;
    task.dueDate = dueDate;
    task.tags = normalizedTags;
  } else {
    const newTask = {
      id: generateId(),
      title,
      description,
      priority,
      dueDate,
      tags: normalizedTags,
      status: "Backlog",
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
  }

  saveTasks();
  renderBoard();
  closeModal();
}

/* =========================
   RENDER BOARD
========================= */
function renderBoard() {
  document.getElementById("Backlog").innerHTML = "";
  document.getElementById("In Progress").innerHTML = "";
  document.getElementById("Done").innerHTML = "";

  const filteredTasks = applyFilters(tasks);

  filteredTasks.forEach(task => {
    const card = renderTaskCard(task);
    document.getElementById(task.status).appendChild(card);
  });

  buildTagFilterOptions();
}

/* =========================
   RENDER CARD
========================= */
function renderTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true;
  card.dataset.id = task.id;

  const today = new Date().toISOString().split("T")[0];
  const isOverdue = task.dueDate < today && task.status !== "Done";

  if (isOverdue) card.classList.add("overdue");

  const priorityClass =
    task.priority === "P1"
      ? "badge-p1"
      : task.priority === "P2"
      ? "badge-p2"
      : "badge-p3";

  card.innerHTML = `
    <strong>${task.title}</strong>
    <p>${task.description || ""}</p>
    <div>
      <span class="badge ${priorityClass}">${task.priority}</span>
      ${isOverdue ? '<span class="badge badge-overdue">Overdue</span>' : ""}
    </div>
    <small>Due: ${task.dueDate}</small>
    <div class="card-actions">
      <button onclick="editTask('${task.id}')">Edit</button>
      <button onclick="deleteTask('${task.id}')">Delete</button>
    </div>
  `;

  return card;
}
/* =========================
   MODAL CONTROLS
========================= */
function setupEventListeners() {
  document.getElementById("openModalBtn").addEventListener("click", openModal);
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("taskForm").addEventListener("submit", handleFormSubmit);

  document.getElementById("priorityFilter").addEventListener("change", renderBoard);
  document.getElementById("tagFilter").addEventListener("change", renderBoard);
  document.getElementById("sortDueDate").addEventListener("change", renderBoard);

  setupDragAndDrop();
}

function openModal() {
  editingTaskId = null;
  document.getElementById("taskForm").reset();
  document.getElementById("taskModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

/* =========================
   EDIT TASK
========================= */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  editingTaskId = id;

  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("priority").value = task.priority;
  document.getElementById("dueDate").value = task.dueDate;
  document.getElementById("tags").value = task.tags.join(", ");

  document.getElementById("taskModal").classList.remove("hidden");
}

/* =========================
   DELETE TASK
========================= */
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderBoard();
}

/* =========================
   FILTERING + SORTING
========================= */
function applyFilters(taskList) {
  const priorityValue = document.getElementById("priorityFilter").value;
  const tagValue = document.getElementById("tagFilter").value;
  const sortOrder = document.getElementById("sortDueDate").value;

  let filtered = [...taskList];

  if (priorityValue !== "all") {
    filtered = filtered.filter(t => t.priority === priorityValue);
  }

  if (tagValue !== "all") {
    filtered = filtered.filter(t => t.tags.includes(tagValue));
  }

  filtered.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.dueDate.localeCompare(b.dueDate);
    } else {
      return b.dueDate.localeCompare(a.dueDate);
    }
  });

  return filtered;
}

function buildTagFilterOptions() {
  const select = document.getElementById("tagFilter");
  const uniqueTags = new Set();

  tasks.forEach(t => t.tags.forEach(tag => uniqueTags.add(tag)));

  const currentValue = select.value;
  select.innerHTML = `<option value="all">All Tags</option>`;

  uniqueTags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });

  select.value = currentValue;
}

/* =========================
   DRAG & DROP
========================= */
function setupDragAndDrop() {
  document.querySelectorAll(".column").forEach(column => {
    column.addEventListener("dragover", e => {
      e.preventDefault();
    });

    column.addEventListener("drop", e => {
      const taskId = e.dataTransfer.getData("text/plain");
      const newStatus = column.dataset.status;
      moveTask(taskId, newStatus);
    });
  });
}

document.addEventListener("dragstart", function(e) {
  if (e.target.classList.contains("task-card")) {
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
  }
});

/* =========================
   MOVE TASK
========================= */
function moveTask(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const today = new Date().toISOString().split("T")[0];

  if (newStatus === "Done" && task.dueDate < today) {
    const confirmMove = confirm("Task is overdue. Mark as Done anyway?");
    if (!confirmMove) return;
  }

  task.status = newStatus;

  saveTasks();
  renderBoard();
}