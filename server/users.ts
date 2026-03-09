import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me-in-production';

// Middleware to protect routes and inject the user
router.use((req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

// User self-settings (Update own login, email, password)
router.put('/me', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { username, recovery_email, new_password, current_password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    // Verify current password to allow changes
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(403).json({ error: 'Senha atual incorreta' });
    }

    let passwordHash = user.password_hash;
    if (new_password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(new_password, salt);
    }

    // Check if new username is taken by someone else
    if (username !== user.username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
      if (existing) {
        return res.status(400).json({ error: 'Login indisponível' });
      }
    }

    db.prepare(`
      UPDATE users 
      SET username = ?, recovery_email = ?, password_hash = ?
      WHERE id = ?
    `).run(username, recovery_email || user.recovery_email, passwordHash, userId);

    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

// ---- ADMIN ROUTES ----
// Middleware to ensure user is admin for the routes below
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// List all users
router.get('/', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, username, email, role, status, recovery_email, requires_password_change, created_at FROM users').all();
  res.json({ users });
});

// Create a new user
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, username, email, password, role, recovery_email } = req.body;

    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ error: 'Login ou E-mail já cadastrados' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = Math.random().toString(36).substring(2, 15);
    
    // Admins creating users will force them to change the password
    const requiresChange = 1;

    db.prepare(`
      INSERT INTO users (id, name, username, email, password_hash, role, status, recovery_email, requires_password_change)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(id, name, username, email, passwordHash, role, recovery_email || null, requiresChange);

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Update a user (admin edit)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, role, status, recovery_email } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?').get(username, email, id);
    if (existingUser) {
      return res.status(400).json({ error: 'Login ou E-mail já cadastrados por outro usuário' });
    }

    db.prepare(`
      UPDATE users 
      SET name = ?, username = ?, email = ?, role = ?, status = ?, recovery_email = ?
      WHERE id = ?
    `).run(name, username, email, role, status, recovery_email || null, id);

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Reset user's password (admin action)
router.post('/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nova senha é obrigatória' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    db.prepare(`
      UPDATE users 
      SET password_hash = ?, requires_password_change = 1
      WHERE id = ?
    `).run(passwordHash, id);

    res.json({ message: 'Senha redefinida com sucesso. O usuário deverá criar uma nova senha no próximo acesso.' });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
});

// Delete user
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    // Don't let the user delete themselves
    if (id === (req as any).user.id) {
      return res.status(400).json({ error: 'Você não pode excluir a sua própria conta' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

export default router;
