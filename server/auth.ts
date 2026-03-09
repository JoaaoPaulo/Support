import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me-in-production';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Conta inativa. Contate o administrador.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Check if user requires password change
    if (user.requires_password_change) {
      // Issue a temporary token specifically for password reset
      const tempToken = jwt.sign({ id: user.id, username: user.username, reset_flow: true }, JWT_SECRET, { expiresIn: '15m' });
      return res.status(403).json({ 
        error: 'É necessário redefinir a senha no primeiro acesso.',
        requires_password_change: true,
        temp_token: tempToken
      });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, recovery_email: user.recovery_email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Complete first password reset
router.post('/first-reset', async (req, res) => {
  try {
    const { tempToken, newPassword } = req.body;
    
    if (!tempToken || !newPassword) {
      return res.status(400).json({ error: 'Token temporário e nova senha são obrigatórios' });
    }

    const decoded = jwt.verify(tempToken, JWT_SECRET) as any;
    
    if (!decoded.reset_flow) {
      return res.status(400).json({ error: 'Token inválido para redefinição de senha' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    db.prepare(`
      UPDATE users SET password_hash = ?, requires_password_change = 0 WHERE id = ?
    `).run(passwordHash, decoded.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as any;
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Senha alterada com sucesso. Login efetuado.',
      token,
      user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, recovery_email: user.recovery_email }
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(401).json({ error: 'Sessão expirada ou token inválido' });
  }
});

// Get current user (Verify token)
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.reset_flow) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const user = db.prepare('SELECT id, name, username, email, role, status, recovery_email, created_at FROM users WHERE id = ?').get(decoded.id) as any;
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Conta inativa' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

export default router;
