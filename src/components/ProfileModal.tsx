import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Camera } from 'lucide-react';
import { User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileModal({ user, onClose }: { user: UserType, onClose: () => void }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.recovery_email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { token } = useAuth();

  const handleSave = async () => {
    try {
      if (!currentPassword) {
        setError('A senha atual é obrigatória para fazer alterações.');
        return;
      }
      setLoading(true);
      setError('');
      setSuccess('');
      
      const payload: any = { username, recovery_email: email, current_password: currentPassword };
      if (newPassword) payload.new_password = newPassword;

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar dados');
      
      setSuccess('Dados atualizados com sucesso!');
      setTimeout(() => {
        onClose();
        window.location.reload(); 
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-dark">Configurações da Conta</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-xl text-sm">{success}</div>}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Login (Username)</label>
            <input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text" 
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">E-mail de Recuperação</label>
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" 
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Senha Atual *</label>
            <input 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password" 
              placeholder="Sua senha atual"
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Nova Senha (opcional)</label>
            <input 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password" 
              placeholder="Deixe em branco para não alterar"
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-dark hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
