import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    // Simple mock login
    if (username === "jp.almeida" && password === "12345") {
      res.json({ 
        success: true, 
        user: {
          id: '1',
          name: 'João',
          email: 'joao@support.com',
          avatar: 'https://i.pravatar.cc/150?u=joao_agent'
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
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
