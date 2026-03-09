import React from 'react';

export default function AgentsView({ agents, setAgents, onToggleActive, onDelete, onUpdateNotifications }: any) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-4">Agentes</h1>
      <p className="text-slate-500">Visualização de agentes gerais. O gerenciamento administrativo agora é feito pela aba "Administrar".</p>
    </div>
  );
}
