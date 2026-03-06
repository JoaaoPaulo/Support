/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Building2, 
  Users, 
  Search, 
  Bell, 
  User,
  Menu,
  X,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  Check,
  AlertCircle,
  ChevronDown,
  Edit2,
  Camera,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Agent, 
  Organization, 
  Conversation, 
  ConversationStatus,
  Message,
  MessageStatus,
  UserPresence,
  User as UserType
} from './types';
import { 
  MOCK_AGENTS, 
  MOCK_ORGANIZATIONS, 
  MOCK_CONVERSATIONS
} from './mockData';

type View = 'support' | 'organizations' | 'agents';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('support');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userPresence, setUserPresence] = useState<UserPresence>(UserPresence.AVAILABLE);
  const [showPresenceMenu, setShowPresenceMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType>({
    id: '1',
    name: 'João',
    email: 'joao@support.com',
    avatar: 'https://i.pravatar.cc/150?u=joao_agent',
    notifications: { newCall: true, closedCall: true, assignedToMe: true, participations: true }
  });
  
  // State for data
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  // Support App State
  const [chatSegment, setChatSegment] = useState<ConversationStatus>(ConversationStatus.OPEN);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleSendMessage = (conversationId: string, text: string, isInternal: boolean = false) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          text,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: isInternal ? undefined : MessageStatus.SENT,
          isInternal
        };
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: isInternal ? conv.lastMessage : text,
          lastMessageTime: isInternal ? conv.lastMessageTime : newMessage.timestamp
        };
      }
      return conv;
    }));
  };

  const handleUpdateCurrentUserNotification = (key: keyof NonNullable<UserType['notifications']>, value: boolean) => {
    setCurrentUser(prev => ({
      ...prev,
      notifications: {
        ...(prev.notifications || { newCall: true, closedCall: true, assignedToMe: true, participations: true }),
        [key]: value
      }
    }));
  };

  const handleUpdateAgentNotifications = (agentId: string, key: keyof NonNullable<Agent['notifications']>, value: boolean) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          notifications: {
            ...(a.notifications || { newCall: true, closedCall: true, assignedToMe: true, participations: true }),
            [key]: value
          }
        };
      }
      return a;
    }));
  };

  const handleCloseConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, status: ConversationStatus.CLOSED };
      }
      return conv;
    }));
    setSelectedConversationId(null);
  };

  const handleUpdateOrganization = (conversationId: string, orgId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, organizationId: orgId };
      }
      return conv;
    }));
  };

  const toggleAgentActive = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  const toggleOrgActive = (id: string) => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
  };

  const deleteOrg = (id: string) => {
    setOrganizations(prev => prev.filter(o => o.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case 'support':
        return (
          <SupportView 
            conversations={conversations}
            agents={agents}
            organizations={organizations}
            chatSegment={chatSegment}
            setChatSegment={setChatSegment}
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
            onSendMessage={handleSendMessage}
            onCloseConversation={handleCloseConversation}
            onUpdateOrganization={handleUpdateOrganization}
          />
        );
      case 'organizations':
        return <OrganizationsView organizations={organizations} setOrganizations={setOrganizations} onToggleActive={toggleOrgActive} onDelete={deleteOrg} />;
      case 'agents':
        return <AgentsView agents={agents} setAgents={setAgents} onToggleActive={toggleAgentActive} onDelete={deleteAgent} onUpdateNotifications={handleUpdateAgentNotifications} />;
      default:
        return <SupportView 
          conversations={conversations}
          agents={agents}
          organizations={organizations}
          chatSegment={chatSegment}
          setChatSegment={setChatSegment}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
          onSendMessage={handleSendMessage}
          onCloseConversation={handleCloseConversation}
          onUpdateOrganization={handleUpdateOrganization}
        />;
    }
  };

  const presenceColors = {
    [UserPresence.AVAILABLE]: 'bg-emerald-500',
    [UserPresence.AWAY]: 'bg-amber-500',
    [UserPresence.OFFLINE]: 'bg-slate-400',
  };

  const presenceLabels = {
    [UserPresence.AVAILABLE]: 'Disponível',
    [UserPresence.AWAY]: 'Ausente',
    [UserPresence.OFFLINE]: 'Offline',
  };

  if (!isAuthenticated) {
    return (
      <LoginView 
        onLoginSuccess={(user: UserType) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  if (currentUser.is_first_login && currentUser.role === 'agent') {
    return (
      <ChangePasswordView 
        user={currentUser} 
        onSuccess={() => setCurrentUser({...currentUser, is_first_login: false})} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="dark-gradient text-white flex flex-col z-50 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between shrink-0">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.h1 
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold tracking-tighter whitespace-nowrap"
              >
                HUB<span className="text-brand-accent">SUPPORT</span>
              </motion.h1>
            ) : (
              <motion.h1 
                key="logo-short"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-brand-accent"
              >
                H
              </motion.h1>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Suporte Chat" 
            active={currentView === 'support'} 
            onClick={() => setCurrentView('support')}
            collapsed={!isSidebarOpen}
          />
          <div className="pt-4 pb-2">
            {isSidebarOpen && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase tracking-widest text-brand-gray font-bold px-2">Configurações</motion.p>}
          </div>
          <NavItem 
            icon={<Building2 size={20} />} 
            label="Organizações" 
            active={currentView === 'organizations'} 
            onClick={() => setCurrentView('organizations')}
            collapsed={!isSidebarOpen}
          />
          {currentUser.role === 'admin' && (
            <NavItem 
              icon={<Users size={20} />} 
              label="Agentes" 
              active={currentView === 'agents'} 
              onClick={() => setCurrentView('agents')}
              collapsed={!isSidebarOpen}
            />
          )}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="relative">
            <button 
              onClick={() => setShowPresenceMenu(!showPresenceMenu)}
              className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-xl transition-colors text-left cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src={currentUser.avatar} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/10 group-hover:border-brand-accent transition-colors" 
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-brand-dark ${presenceColors[userPresence]}`}></div>
              </div>
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden flex-1">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-brand-gray truncate">{presenceLabels[userPresence]}</p>
                </motion.div>
              )}
              {isSidebarOpen && <ChevronDown size={16} className={`text-brand-gray transition-transform ${showPresenceMenu ? 'rotate-180' : ''}`} />}
            </button>

            <AnimatePresence>
              {showPresenceMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 mb-2 w-full bg-brand-blue border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                >
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowPresenceMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 transition-colors text-left cursor-pointer"
                  >
                    <Edit2 size={14} className="text-brand-accent" />
                    <span className="text-xs text-white font-bold">Editar Perfil</span>
                  </button>
                  {Object.values(UserPresence).map((presence) => (
                    <button
                      key={presence}
                      onClick={() => {
                        setUserPresence(presence);
                        setShowPresenceMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full ${presenceColors[presence]}`}></div>
                      <span className="text-xs text-white">{presenceLabels[presence]}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal 
            user={currentUser} 
            onSave={(updatedUser: UserType) => {
              setCurrentUser(updatedUser);
              setShowProfileModal(false);
            }}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-brand-dark capitalize">
              {currentView === 'support' ? 'Atendimento WhatsApp' : currentView}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-dark transition-all w-64"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full relative transition-colors cursor-pointer ${showNotifications ? 'bg-brand-dark text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h4 className="font-bold text-brand-dark text-sm">Minhas Notificações</h4>
                      <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-brand-dark cursor-pointer">
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <NotificationToggle 
                        label="Novo chamado" 
                        value={currentUser.notifications?.newCall ?? true} 
                        onToggle={(val) => handleUpdateCurrentUserNotification('newCall', val)} 
                      />
                      <NotificationToggle 
                        label="Chamado encerrado" 
                        value={currentUser.notifications?.closedCall ?? true} 
                        onToggle={(val) => handleUpdateCurrentUserNotification('closedCall', val)} 
                      />
                      <NotificationToggle 
                        label="Atribuído à você" 
                        value={currentUser.notifications?.assignedToMe ?? true} 
                        onToggle={(val) => handleUpdateCurrentUserNotification('assignedToMe', val)} 
                      />
                      <NotificationToggle 
                        label="Participações" 
                        value={currentUser.notifications?.participations ?? true} 
                        onToggle={(val) => handleUpdateCurrentUserNotification('participations', val)} 
                      />
                    </div>
                    <div className="p-4 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 text-center">Somente você pode alterar suas preferências.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function ChangePasswordView({ user, onSuccess }: { user: UserType, onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, password }),
      });
      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Erro ao alterar a senha.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-gradient flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Primeiro Acesso</h1>
          <p className="text-brand-gray text-sm">Por segurança, você precisa alterar sua senha inicial para continuar.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-2 ml-1">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua nova senha" minLength={5} className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-brand-dark transition-all" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-2 ml-1">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" minLength={5} className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-brand-dark transition-all" required />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70">
            {isLoading ? 'Salvando...' : 'Salvar Senha'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

const NotificationToggle = ({ label, value, onToggle }: { label: string, value: boolean, onToggle: (val: boolean) => void }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <span className="text-[10px] text-slate-500 font-medium">{label}</span>
    <button 
      onClick={() => onToggle(!value)}
      className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${value ? 'bg-brand-accent' : 'bg-slate-200'}`}
    >
      <motion.div 
        animate={{ x: value ? 16 : 2 }}
        className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

function LoginView({ onLoginSuccess }: { onLoginSuccess: (user: UserType) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Credenciais inválidas.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-gradient flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-dark rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <MessageSquare size={40} className="text-brand-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-brand-dark">
            HUB<span className="text-brand-accent">SUPPORT</span>
          </h1>
          <p className="text-brand-gray mt-2 font-medium">Bem-vindo de volta!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-2 ml-1">Usuário</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu usuário" 
                className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-brand-dark transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-2 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha" 
                className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-brand-dark transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-dark/20 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
          >
            {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-10">
          Problemas com o acesso? <a href="#" className="text-brand-dark font-bold hover:underline">Contate o suporte</a>
        </p>
      </motion.div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
        active 
          ? 'bg-brand-accent text-brand-dark font-bold shadow-lg shadow-brand-accent/20' 
          : 'text-brand-light hover:bg-white/5'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="text-sm">{label}</span>}
    </button>
  );
}



function ProfileModal({ user, onSave, onClose }: { user: UserType, onSave: (u: UserType) => void, onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);

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
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-dark">Editar Perfil</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <img 
              src={avatar} 
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 group-hover:opacity-80 transition-opacity" 
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setAvatar(`https://i.pravatar.cc/150?u=${Math.random()}`)}
              className="absolute bottom-0 right-0 p-2 bg-brand-dark text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">Clique no ícone para trocar o avatar</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Nome Completo</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text" 
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-brand-gray mb-1">E-mail</label>
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" 
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
            onClick={() => onSave({ ...user, name, email, avatar })}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-dark hover:opacity-90 transition-opacity cursor-pointer"
          >
            Salvar Alterações
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SupportView({ 
  conversations, 
  agents, 
  organizations, 
  chatSegment, 
  setChatSegment,
  selectedConversationId,
  setSelectedConversationId,
  onSendMessage,
  onCloseConversation,
  onUpdateOrganization
}: any) {
  const [messageInput, setMessageInput] = useState('');
  const [isInternalMode, setIsInternalMode] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  
  const filteredConversations = conversations.filter((c: any) => c.status === chatSegment);
  const selectedConversation = conversations.find((c: any) => c.id === selectedConversationId);
  const availableAgents = agents.filter((a: any) => a.active && a.name.toLowerCase().includes(mentionSearch.toLowerCase()));

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    onSendMessage(selectedConversationId, messageInput, isInternalMode);
    setMessageInput('');
    setIsInternalMode(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (isInternalMode) {
      const lastAtPos = value.lastIndexOf('@');
      if (lastAtPos !== -1 && lastAtPos >= value.lastIndexOf(' ')) {
        const search = value.substring(lastAtPos + 1);
        setMentionSearch(search);
        setShowMentionList(true);
      } else {
        setShowMentionList(false);
      }
    } else {
      setShowMentionList(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentionList && e.key === 'Enter') {
      const firstAgent = availableAgents[0];
      if (firstAgent) {
        insertMention(firstAgent.name);
        e.preventDefault();
      }
    } else if (e.key === 'Enter') {
      handleSend();
    }
  };

  const insertMention = (agentName: string) => {
    const lastAtPos = messageInput.lastIndexOf('@');
    const newValue = messageInput.substring(0, lastAtPos) + '@' + agentName + ' ';
    setMessageInput(newValue);
    setShowMentionList(false);
  };

  const activeOrganizations = organizations.filter((o: any) => o.active || o.id === selectedConversation?.organizationId);

  const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
    if (!status) return null;
    switch (status) {
      case MessageStatus.SENT:
        return <Check size={14} className="text-slate-400" />;
      case MessageStatus.DELIVERED:
        return <div className="flex -space-x-2"><Check size={14} className="text-slate-400" /><Check size={14} className="text-slate-400" /></div>;
      case MessageStatus.READ:
        return <div className="flex -space-x-2"><Check size={14} className="text-brand-accent" /><Check size={14} className="text-brand-accent" /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex gap-6 relative">
      {/* Conversation List */}
      <div className="w-96 bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setChatSegment(ConversationStatus.OPEN)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                chatSegment === ConversationStatus.OPEN 
                  ? 'bg-white text-brand-dark shadow-sm' 
                  : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Abertas
            </button>
            <button 
              onClick={() => setChatSegment(ConversationStatus.CLOSED)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                chatSegment === ConversationStatus.CLOSED 
                  ? 'bg-white text-brand-dark shadow-sm' 
                  : 'text-slate-500 hover:text-brand-dark'
              }`}
            >
              Fechadas
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            filteredConversations.map((conv: any) => {
              const agent = agents.find((a: any) => a.id === conv.assignedAgentId);
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-4 flex gap-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left cursor-pointer ${
                    selectedConversationId === conv.id ? 'bg-slate-50 border-l-4 border-l-brand-dark' : ''
                  }`}
                >
                  <img 
                    src={conv.customerAvatar} 
                    className="w-12 h-12 rounded-full object-cover shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-brand-dark truncate">{conv.customerName}</h5>
                      <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-brand-accent/20 flex items-center justify-center">
                        <User size={10} className="text-brand-dark" />
                      </div>
                      <span className="text-[10px] font-medium text-brand-gray">Agente: {agent?.name || 'Não atribuído'}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedConversation.customerAvatar} 
                  className="w-10 h-10 rounded-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="font-bold text-brand-dark">{selectedConversation.customerName}</h5>
                  <div className="flex items-center gap-2">
                    <select 
                      value={selectedConversation.organizationId}
                      onChange={(e) => onUpdateOrganization(selectedConversation.id, e.target.value)}
                      className="text-[10px] text-brand-gray uppercase tracking-wider font-bold bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-brand-dark transition-colors"
                    >
                      {activeOrganizations.map((org: any) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer">
                  <Clock size={20} />
                </button>
                {selectedConversation.status === ConversationStatus.OPEN && (
                  <button 
                    onClick={() => setShowCloseConfirm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                    title="Encerrar Chamado"
                  >
                    <CheckCircle2 size={16} />
                    Encerrar Chamado
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {selectedConversation.messages.map((msg: any) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-4 rounded-2xl text-sm relative ${
                    msg.isInternal
                      ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-none'
                      : msg.sender === 'agent' 
                        ? 'bg-brand-dark text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-brand-dark rounded-tl-none shadow-sm'
                  }`}>
                    {msg.isInternal && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-bold uppercase text-amber-600">
                        <AlertCircle size={10} />
                        Comentário Interno
                      </div>
                    )}
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className={`text-[10px] ${msg.sender === 'agent' ? (msg.isInternal ? 'text-amber-700/60' : 'text-brand-light/60') : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </p>
                      {msg.sender === 'agent' && !msg.isInternal && <MessageStatusIcon status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 relative">
              {showMentionList && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-400">Mencionar Agente</div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableAgents.length > 0 ? (
                      availableAgents.map((agent: any) => (
                        <button
                          key={agent.id}
                          onClick={() => insertMention(agent.name)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <img src={agent.avatar} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                          <span className="text-xs font-medium text-brand-dark">{agent.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">Nenhum agente disponível</div>
                    )}
                  </div>
                </motion.div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setIsInternalMode(false)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!isInternalMode ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  Público
                </button>
                <button 
                  onClick={() => setIsInternalMode(true)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${isInternalMode ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  Interno
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={isInternalMode ? "Escreva um comentário interno... (use @ para mencionar)" : "Digite sua mensagem..."}
                  className={`flex-1 border-none rounded-xl px-4 py-3 text-sm transition-all focus:ring-2 ${
                    isInternalMode 
                      ? 'bg-amber-50 focus:ring-amber-500 text-amber-900 placeholder:text-amber-400' 
                      : 'bg-slate-100 focus:ring-brand-dark text-brand-dark'
                  }`}
                />
                <button 
                  type="submit"
                  className={`p-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed ${
                    isInternalMode ? 'bg-amber-500 text-white' : 'bg-brand-dark text-white'
                  }`}
                  disabled={!messageInput.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={40} />
            </div>
            <h4 className="text-lg font-bold text-brand-dark">Selecione uma conversa</h4>
            <p className="max-w-xs mt-2">Escolha um atendimento na lista ao lado para visualizar o histórico de mensagens.</p>
          </div>
        )}
      </div>

      {/* Close Confirmation Modal */}
      <AnimatePresence>
        {showCloseConfirm && (
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
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Encerrar Chamado?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta conversa será movida para a aba de conversas fechadas.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onCloseConversation(selectedConversationId);
                    setShowCloseConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrganizationsView({ organizations, setOrganizations, onToggleActive, onDelete }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    if (!newName || !newDomain) return;
    const newOrg: Organization = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      domain: newDomain,
      active: true
    };
    setOrganizations([...organizations, newOrg]);
    setNewName('');
    setNewDomain('');
    setIsAdding(false);
  };

  const filteredOrganizations = organizations.filter((org: any) => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-brand-dark">Gerenciar Organizações</h3>
          <p className="text-brand-gray">Cadastre as lojas e empresas que utilizam o marketplace.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <Plus size={20} /> Nova Organização
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar organização pelo nome ou domínio..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark transition-all shadow-sm"
        />
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-brand-accent/30 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Nome da Loja</label>
              <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                type="text" 
                placeholder="Ex: Tech Store" 
                className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Domínio/URL</label>
              <input 
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                type="text" 
                placeholder="Ex: techstore.com" 
                className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button 
              onClick={handleAdd}
              className="bg-brand-accent text-brand-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 cursor-pointer"
            >
              Salvar
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="bg-slate-100 text-slate-500 px-6 py-2 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org: any) => (
          <div key={org.id} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all ${!org.active ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-brand-dark text-white rounded-2xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onToggleActive(org.id)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${org.active ? 'bg-brand-accent' : 'bg-slate-300'}`}
                >
                  <motion.div 
                    animate={{ x: org.active ? 20 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
                <button 
                  onClick={() => setDeleteId(org.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-bold text-brand-dark">{org.name}</h4>
            <p className="text-sm text-brand-gray">{org.domain}</p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${org.active ? 'text-brand-accent bg-brand-dark' : 'text-slate-500 bg-slate-100'}`}>
                {org.active ? 'Ativa' : 'Inativa'}
              </span>
              <button className="text-xs font-bold text-brand-dark hover:underline cursor-pointer">Editar Detalhes</button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {deleteId && (
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
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Excluir Organização?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta ação não pode ser desfeita. A organização será removida permanentemente.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onDelete(deleteId);
                    setDeleteId(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentsView({ agents, setAgents, onToggleActive, onDelete }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'agent'>('agent');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch users on mount
  React.useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAgents(data.users.map((u: any) => ({
            id: u.id,
            name: u.username,
            email: u.username + '@support.com',
            avatar: `https://i.pravatar.cc/150?u=${u.username}`,
            active: true,
            role: u.role
          })));
        }
      });
  }, [setAgents]);

  const handleAdd = async () => {
    if (!newUsername || !newPassword) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        const newAgent = {
          id: data.id,
          name: newUsername,
          email: newUsername + '@support.com',
          avatar: `https://i.pravatar.cc/150?u=${newUsername}`,
          active: true,
          role: newRole
        };
        setAgents([...agents, newAgent]);
        setNewUsername('');
        setNewPassword('');
        setNewRole('agent');
        setIsAdding(false);
      } else {
        setErrorMsg(data.message || 'Erro ao criar usuário');
      }
    } catch {
      setErrorMsg('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAgents(agents.filter((a: any) => a.id !== deleteId));
        setDeleteId(null);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent: any) => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-brand-dark">Equipe de Suporte</h3>
          <p className="text-brand-gray">Gerencie os agentes responsáveis pelo atendimento ao cliente.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <Plus size={20} /> Novo Agente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar agente pelo nome ou e-mail..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark transition-all shadow-sm"
        />
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-brand-accent/30 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Login/Usuário</label>
              <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} type="text" placeholder="Ex: jp.agente" className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Senha Inicial</label>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Senha do usuário" className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-gray mb-1">Perfil</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin'|'agent')} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-dark">
                <option value="agent">Agente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {errorMsg && <p className="text-red-500 text-xs mt-2 font-bold">{errorMsg}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={handleAdd} disabled={isLoading} className="bg-brand-accent text-brand-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 cursor-pointer disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="bg-slate-100 text-slate-500 px-6 py-2 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold uppercase text-brand-gray">Agente</th>
              <th className="p-4 text-xs font-bold uppercase text-brand-gray">E-mail</th>
              <th className="p-4 text-xs font-bold uppercase text-brand-gray">Status</th>
              <th className="p-4 text-xs font-bold uppercase text-brand-gray text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent: any) => (
              <tr key={agent.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!agent.active ? 'opacity-60 grayscale' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={agent.avatar} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <span className="font-bold text-brand-dark">{agent.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">{agent.email}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onToggleActive(agent.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${agent.active ? 'bg-brand-accent' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: agent.active ? 20 : 2 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                      />
                    </button>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {agent.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-brand-dark hover:underline font-bold text-xs cursor-pointer">Gerenciar</button>
                    <button 
                      onClick={() => setDeleteId(agent.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {deleteId && (
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
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Excluir Agente?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta ação removerá o agente permanentemente da equipe.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
