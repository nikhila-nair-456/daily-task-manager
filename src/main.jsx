import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const starterTasks = [
  {
    id: 1,
    title: "Complete React assignment",
    category: "College",
    priority: "High",
    dueDate: "2026-10-06",
    completed: false
  },
  {
    id: 2,
    title: "Practice JavaScript",
    category: "Study",
    priority: "Medium",
    dueDate: "2026-10-07",
    completed: false
  },
  {
    id: 3,
    title: "Organize project files",
    category: "Personal",
    priority: "Low",
    dueDate: "2026-10-08",
    completed: true
  }
];

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("daily-task-manager");
    return saved ? JSON.parse(saved) : starterTasks;
  });

  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem("daily-task-manager", JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      percentage: tasks.length ? Math.round((completed / tasks.length) * 100) : 0
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        (filter === "Completed" && task.completed) ||
        (filter === "Pending" && !task.completed) ||
        task.priority === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  function addTask(task) {
    setTasks((current) => [
      ...current,
      { ...task, id: Date.now(), completed: false }
    ]);
    setView("tasks");
  }

  function updateTask(updatedTask) {
    setTasks((current) =>
      current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
    setView("tasks");
  }

  function deleteTask(id) {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <div>
            <h1>TaskFlow</h1>
            <span>Daily Task Manager</span>
          </div>
        </div>

        <nav>
          <button
            className={view === "dashboard" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("dashboard")}
          >
            <span>⌂</span> Dashboard
          </button>
          <button
            className={view === "tasks" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("tasks")}
          >
            <span>☷</span> My Tasks
          </button>
          <button
            className={view === "add" ? "nav-btn active" : "nav-btn"}
            onClick={() => {
              setEditingTask(null);
              setView("add");
            }}
          >
            <span>＋</span> Add Task
          </button>
        </nav>

        <div className="sidebar-bottom">
          <p>ReactJS Assignment</p>
          <small>Task Manager • 2026</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRODUCTIVITY</p>
            <h2>
              {view === "dashboard"
                ? "Good day! 👋"
                : view === "tasks"
                ? "My Tasks"
                : editingTask
                ? "Edit Task"
                : "Create a Task"}
            </h2>
          </div>
          <button
            className="primary-btn"
            onClick={() => {
              setEditingTask(null);
              setView("add");
            }}
          >
            + New Task
          </button>
        </header>

        {view === "dashboard" && (
          <Dashboard stats={stats} tasks={tasks} onNavigate={setView} />
        )}

        {view === "tasks" && (
          <TaskList
            tasks={visibleTasks}
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={(task) => {
              setEditingTask(task);
              setView("add");
            }}
          />
        )}

        {view === "add" && (
          <TaskForm
            initialTask={editingTask}
            onAdd={addTask}
            onUpdate={updateTask}
            onCancel={() => {
              setEditingTask(null);
              setView("tasks");
            }}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({ stats, tasks, onNavigate }) {
  const recent = [...tasks].slice(-4).reverse();

  return (
    <section>
      <div className="hero-card">
        <div>
          <span className="hero-label">TODAY'S PROGRESS</span>
          <h3>Stay focused. Get things done.</h3>
          <p>
            You have completed {stats.completed} out of {stats.total} tasks.
          </p>
        </div>
        <div className="progress-ring">
          <strong>{stats.percentage}%</strong>
          <span>done</span>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Tasks" value={stats.total} icon="☷" />
        <StatCard label="Completed" value={stats.completed} icon="✓" />
        <StatCard label="Pending" value={stats.pending} icon="◷" />
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h3>Recent Tasks</h3>
        </div>
        <button className="text-btn" onClick={() => onNavigate("tasks")}>
          View all →
        </button>
      </div>

      <div className="task-preview">
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          recent.map((task) => (
            <TaskRow key={task.id} task={task} compact />
          ))
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function TaskList({
  tasks,
  search,
  setSearch,
  filter,
  setFilter,
  onToggle,
  onDelete,
  onEdit
}) {
  return (
    <section>
      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
          />
        </div>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div className="list-card">
        <div className="list-header">
          <span>{tasks.length} task(s) found</span>
          <span>Actions</span>
        </div>

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </section>
  );
}

function TaskRow({ task, onToggle, onDelete, onEdit, compact = false }) {
  return (
    <div className={`task-row ${task.completed ? "completed" : ""}`}>
      <button className="check-btn" onClick={() => onToggle?.(task.id)}>
        {task.completed ? "✓" : ""}
      </button>

      <div className="task-main">
        <strong>{task.title}</strong>
        <div className="task-meta">
          <span>{task.category}</span>
          {!compact && <span>Due: {task.dueDate}</span>}
          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="actions">
          <button onClick={() => onEdit(task)} title="Edit">✎</button>
          <button onClick={() => onDelete(task.id)} title="Delete">⌫</button>
        </div>
      )}
    </div>
  );
}

function TaskForm({ initialTask, onAdd, onUpdate, onCancel }) {
  const [form, setForm] = useState(
    initialTask || {
      title: "",
      category: "College",
      priority: "Medium",
      dueDate: ""
    }
  );
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (form.title.trim().length < 3) {
      setError("Task title must contain at least 3 characters.");
      return;
    }

    if (!form.dueDate) {
      setError("Please select a due date.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (form.dueDate < today) {
      setError("Due date cannot be in the past.");
      return;
    }

    if (initialTask) {
      onUpdate({ ...form, title: form.title.trim() });
    } else {
      onAdd({ ...form, title: form.title.trim() });
    }
  }

  return (
    <section className="form-section">
      <div className="form-card">
        <div className="form-intro">
          <span className="form-icon">✓</span>
          <div>
            <p className="eyebrow">{initialTask ? "UPDATE" : "CREATE"}</p>
            <h3>{initialTask ? "Edit your task" : "Add a new task"}</h3>
            <p>Fill in the details below to manage your task.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Task Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Finish DBMS assignment"
            />
          </label>

          <div className="two-col">
            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                <option>College</option>
                <option>Study</option>
                <option>Personal</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
          </div>

          <label>
            Due Date
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {initialTask ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <div>✓</div>
      <h3>No tasks found</h3>
      <p>Try adding a task or changing your search/filter.</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
