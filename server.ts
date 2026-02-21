import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("hospital.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    status TEXT DEFAULT 'active',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add columns if they don't exist
try {
  db.exec("ALTER TABLE departments ADD COLUMN category TEXT DEFAULT 'other'");
} catch (e) {}
try {
  db.exec("ALTER TABLE departments ADD COLUMN status TEXT DEFAULT 'active'");
} catch (e) {}
try {
  db.exec("ALTER TABLE departments ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/departments", (req, res) => {
    try {
      const depts = db.prepare("SELECT * FROM departments ORDER BY category, name ASC").all();
      res.json(depts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", (req, res) => {
    const { name, url, category, status } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }
    try {
      const info = db.prepare("INSERT INTO departments (name, url, category, status) VALUES (?, ?, ?, ?)").run(name, url, category || 'other', status || 'active');
      res.json({ id: info.lastInsertRowid, name, url, category, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", (req, res) => {
    const { id } = req.params;
    const { name, url, category, status } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }
    try {
      db.prepare("UPDATE departments SET name = ?, url = ?, category = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, url, category, status, id);
      res.json({ id: Number(id), name, url, category, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM departments WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete department" });
    }
  });

  app.get("/api/github/repo", async (req, res) => {
    const owner = process.env.GITHUB_REPO_OWNER || "facebook";
    const repo = process.env.GITHUB_REPO_NAME || "react";
    const token = process.env.GITHUB_TOKEN;

    try {
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Prachuap-Hospital-App"
      };
      if (token) headers["Authorization"] = `token ${token}`;

      const [repoRes, commitsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { headers })
      ]);

      if (!repoRes.ok) throw new Error("Failed to fetch repo info");
      
      const repoData = await repoRes.json();
      const commitsData = await commitsRes.json();

      res.json({
        name: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        url: repoData.html_url,
        recentCommits: Array.isArray(commitsData) ? commitsData.map((c: any) => ({
          message: c.commit.message,
          date: c.commit.author.date,
          author: c.commit.author.name,
          url: c.html_url
        })) : []
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GitHub data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
