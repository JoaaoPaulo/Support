import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, UserX, UserCheck, Shield, Users, Edit2, Key, Trash2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

export default function AdminView() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const toggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...user, status: newStatus })
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Status toggle failed', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
      else alert((await res.json()).error || 'Erro ao excluir');
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const forcePasswordReset = async (id: string) => {
    const newPassword = window.prompt('Digite a senha provisória para o usuário (ele será forçado a trocá-la no próximo login):');
    if (!newPassword) return;

    try {
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Password reset failed', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Gerenciamento de Acessos</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de perfis, senhas e status de agentes.</p>
        </div>
        <button 
          onClick={() => {
            setModalMode('create');
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="bg-brand-dark text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent hover:text-brand-dark transition-all shadow-lg"
        >
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por Nome ou Login..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-dark transition-all"
            />
          </div>
          <div className="text-xs font-medium text-slate-400">
            Total de registros: {filteredUsers.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center p-8">
              <Loader2 className="animate-spin text-brand-accent" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Login</th>
                  <th className="p-4">Perfil</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-bold text-brand-dark text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{user.username}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {user.role === 'admin' ? <Shield size={14} className="text-brand-accent" /> : <Users size={14} className="text-slate-400" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {user.role === 'admin' ? 'Coordenador' : 'Agente'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      {user.requires_password_change === 1 && (
                        <span className="block mt-1 text-[10px] text-amber-500 font-bold" title="Precisa Redefinir Senha">
                          (Pendente Senha)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => forcePasswordReset(user.id)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Forçar Redefinição de Senha"
                        >
                          <Key size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setModalMode('edit');
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Dados"
                        >
                          <Edit2 size={16} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <>
                            <button 
                              onClick={() => toggleStatus(user)}
                              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                user.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                              }`}
                              title={user.status === 'active' ? 'Inativar Usuário' : 'Ativar Usuário'}
                            >
                              {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-2"
                              title="Excluir Usuário"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <UserEditModal 
            mode={modalMode} 
            userData={editingUser} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchUsers();
            }}
            token={token}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// User Modal Component
function UserEditModal({ mode, userData, onClose, onSuccess, token }: any) {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    username: userData?.username || '',
    email: userData?.email || '',
    password: '',
    role: userData?.role || 'agent',
    recovery_email: userData?.recovery_email || '',
    status: userData?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'create' ? '/api/users' : `/api/users/${userData.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar usuário');
      
      onSuccess();
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
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-dark">{mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Nome Completo</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Login (Username)</label>
              <input 
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">E-mail Corporativo</label>
              <input 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Perfil de Acesso</label>
              <select
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-dark outline-none"
              >
                <option value="agent">Agente (Padrão)</option>
                <option value="admin">Coordenador (Admin)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">E-mail de Recuperação (Secundário)</label>
            <input 
              value={formData.recovery_email}
              onChange={e => setFormData({...formData, recovery_email: e.target.value})}
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-dark outline-none"
            />
          </div>

          {mode === 'create' && (
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Senha Inicial Provisória</label>
              <p className="text-[10px] text-slate-400 mb-2">O usuário será forçado a redefinir esta senha no primeiro login.</p>
              <input 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                type="password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>
          )}

          <div className="mt-8 flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-dark hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
