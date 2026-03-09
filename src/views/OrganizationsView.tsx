import React from 'react';

export default function OrganizationsView({ organizations, setOrganizations, onToggleActive, onDelete }: any) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-brand-dark mb-4">Organizacões</h1>
      <p className="text-slate-500">Espaço para gerenciar os clientes B2B. Interface sendo desenvolvida.</p>
    </div>
  );
}
