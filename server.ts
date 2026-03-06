import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { db } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database API routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password) as any;
      if (user) {
        res.json({ 
          success: true, 
          user: {
            id: user.id,
            name: user.username,
            email: user.username + '@support.com', // Placeholder
            avatar: `https://i.pravatar.cc/150?u=${user.username}`,
            role: user.role,
            is_first_login: user.is_first_login === 1
          }
        });
      } else {
        res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
  });

  app.post("/api/change-password", (req, res) => {
    const { id, password } = req.body;
    try {
      db.prepare('UPDATE users SET password = ?, is_first_login = 0 WHERE id = ?').run(password, id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const users = db.prepare('SELECT id, username, role, is_first_login FROM users').all();
      res.json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
  });

  app.post("/api/users", (req, res) => {
    const { username, password, role } = req.body;
    try {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const is_first_login = role === 'agent' ? 1 : 0;
      db.prepare('INSERT INTO users (id, username, password, role, is_first_login) VALUES (?, ?, ?, ?, ?)').run(id, username, password, role, is_first_login);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ success: false, message: "Usuário já existe." });
      } else {
        res.status(500).json({ success: false, message: "Erro interno no servidor." });
      }
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erro interno no servidor." });
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
