import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Users, Volume2, VolumeX } from 'lucide-react';

export default function NotificationsPanel({ show, isMuted, setIsMuted }: any) {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h4 className="font-bold text-brand-dark text-sm">Notificações</h4>
        <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-brand-dark cursor-pointer">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
            <MessageSquare size={14} className="text-brand-dark" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-dark">Novo chamado: João Pereira</p>
            <p className="text-[10px] text-slate-500">Há 2 minutos</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Users size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-dark">Bruno Costa entrou online</p>
            <p className="text-[10px] text-slate-500">Há 15 minutos</p>
          </div>
        </div>
      </div>
      <button className="w-full p-3 text-center text-xs font-bold text-brand-dark border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
        Ver todas as notificações
      </button>
    </motion.div>
  );
}
