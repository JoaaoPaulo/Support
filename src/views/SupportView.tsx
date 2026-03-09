import React, { useState } from 'react';
import { User, CheckCircle2, Clock, MessageSquare, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConversationStatus, MessageStatus } from '../types';

export default function SupportView({ 
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
                  placeholder={isInternalMode ? "Escreva um comentário interno... (use @ para mencionar)" : "Digite sua mensagem..."}
                  className={`flex-1 border-none rounded-xl px-4 py-3 text-sm transition-all focus:ring-2 ${
                    isInternalMode 
                      ? 'bg-amber-50 focus:ring-amber-500 text-amber-900 placeholder:text-amber-400' 
                      : 'bg-slate-100 focus:ring-brand-dark text-brand-dark'
                  }`}
                />
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center min-w-[48px] ${
                    isInternalMode 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-200' 
                      : 'bg-brand-accent hover:bg-brand-accent/80 text-brand-dark disabled:bg-slate-100 disabled:text-slate-400'
                  }`}
                >
                  <MessageSquare size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <MessageSquare size={48} className="mb-4 text-slate-300" />
            <p>Selecione uma conversa para começar o atendimento</p>
          </div>
        )}
      </div>

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
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Encerrar Chamado?</h3>
              <p className="text-slate-500 text-sm mb-6">A conversa passará para o histórico de fechadas.</p>
              
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
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer"
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
