import React, { useState } from 'react';
import { 
  MessageSquare, 
  Building2, 
  Users, 
  Search, 
  Bell, 
  Menu,
  X,
  Loader2,
  Shield,
  ChevronDown,
  Edit2,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ConversationStatus,
  UserPresence,
  User as UserType,
  Agent,
  Organization,
  Conversation
} from './types';
import { 
  MOCK_AGENTS, 
  MOCK_ORGANIZATIONS, 
  MOCK_CONVERSATIONS
} from './mockData';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SupportView from './views/SupportView';
import OrganizationsView from './views/OrganizationsView';
import AgentsView from './views/AgentsView';
import AdminView from './views/AdminView';
import ProfileModal from './components/ProfileModal';
import NotificationsPanel from './components/NotificationsPanel';

type View = 'support' | 'organizations' | 'agents' | 'admin';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('support');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userPresence, setUserPresence] = useState<UserPresence>(UserPresence.AVAILABLE);
  const [showPresenceMenu, setShowPresenceMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // State for data (simulated until backend replaces these fully)
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  // Support App State
  const [chatSegment, setChatSegment] = useState<ConversationStatus>(ConversationStatus.OPEN);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brand-dark">
        <Loader2 className="animate-spin text-brand-accent" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleSendMessage = (conversationId: string, text: string, isInternal: boolean = false) => {
    // simplified implementation for mock consistency
    console.log("Send msg:", text);
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
            onCloseConversation={() => setSelectedConversationId(null)}
            onUpdateOrganization={() => {}}
          />
        );
      case 'organizations':
        return <OrganizationsView />;
      case 'agents':
        return <AgentsView />;
      case 'admin':
        if (user.role !== 'admin') {
          setCurrentView('support');
          return null;
        }
        return <AdminView />;
      default:
        return null;
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
            {isSidebarOpen && <motion.p className="text-[10px] uppercase tracking-widest text-brand-gray font-bold px-2">Configurações</motion.p>}
          </div>
          <NavItem 
            icon={<Building2 size={20} />} 
            label="Organizações" 
            active={currentView === 'organizations'} 
            onClick={() => setCurrentView('organizations')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Agentes" 
            active={currentView === 'agents'} 
            onClick={() => setCurrentView('agents')}
            collapsed={!isSidebarOpen}
          />
          {user.role === 'admin' && (
            <NavItem 
              icon={<Shield size={20} />} 
              label="Administrar" 
              active={currentView === 'admin'} 
              onClick={() => setCurrentView('admin')}
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
                  src={user.avatar} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/10 group-hover:border-brand-accent transition-colors" 
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-brand-dark ${presenceColors[userPresence]}`}></div>
              </div>
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden flex-1">
                  <p className="text-sm font-medium truncate">{user.name}</p>
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
                    <span className="text-xs text-white font-bold">Configurações da Conta</span>
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
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-3 hover:bg-red-500/20 border-t border-white/5 transition-colors text-left cursor-pointer mt-1"
                  >
                    <LogOut size={14} className="text-red-400" />
                    <span className="text-xs text-red-400 font-bold">Sair do Sistema</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal 
            user={user} 
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-brand-dark capitalize">
              {currentView === 'support' ? 'Atendimento WhatsApp' : currentView === 'admin' ? 'Painel de Administração' : currentView}
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
                <NotificationsPanel show={showNotifications} isMuted={isMuted} setIsMuted={setIsMuted} />
              </AnimatePresence>
            </div>
          </div>
        </header>

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
