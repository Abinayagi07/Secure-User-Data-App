const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "local-development-secret-change-me";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("trust proxy", 1);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60
  }
}));

const db = new sqlite3.Database("./users.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please log in first." });
  }
  next();
}

app.get("/", (req, res) => {
  res.redirect(req.session.userId ? "/dashboard.html" : "/login.html");
});

app.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || password.length < 6) {
    return res.status(400).send("Please enter all fields. Password must be at least 6 characters.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      function (err) {
        if (err) return res.status(409).send("Email already registered.");
        res.redirect("/login.html?registered=1");
      }
    );
  } catch {
    res.status(500).send("Registration failed.");
  }
});

app.post("/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) return res.status(401).send("Invalid email or password.");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid email or password.");

    req.session.regenerate((sessionErr) => {
      if (sessionErr) return res.status(500).send("Login failed.");

      req.session.userId = user.id;
      req.session.userName = user.name;
      res.redirect("/dashboard.html");
    });
  });
});

app.get("/api/me", requireLogin, (req, res) => {
  res.json({ name: req.session.userName });
});

app.get("/api/my-data", requireLogin, (req, res) => {
  db.all(
    "SELECT id, data, created_at FROM user_data WHERE user_id = ? ORDER BY id DESC",
    [req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error." });
      res.json(rows);
    }
  );
});

app.post("/api/my-data", requireLogin, (req, res) => {
  const data = String(req.body.data || "").trim();

  if (!data || data.length > 500) {
    return res.status(400).json({ message: "Enter data between 1 and 500 characters." });
  }

  db.run(
    "INSERT INTO user_data (user_id, data) VALUES (?, ?)",
    [req.session.userId, data],
    function (err) {
      if (err) return res.status(500).json({ message: "Could not save data." });
      res.status(201).json({ message: "Data saved successfully.", id: this.lastID });
    }
  );
});

app.delete("/api/my-data/:id", requireLogin, (req, res) => {
  db.run(
    "DELETE FROM user_data WHERE id = ? AND user_id = ?",
    [req.params.id, req.session.userId],
    function (err) {
      if (err) return res.status(500).json({ message: "Could not delete data." });
      if (this.changes === 0) return res.status(404).json({ message: "Data not found." });
      res.json({ message: "Data deleted." });
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
