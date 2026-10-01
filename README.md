# Support — Sistema de Atendimento

Painel web de atendimento ao cliente. Agentes acompanham e respondem **conversas**, a equipe de **agentes** e as **organizações** atendidas ficam centralizadas, e administradores gerenciam os acessos ao sistema.

## Funcionalidades

- **Atendimento** — lista de conversas com mensagens, status e responsável, além de painel de notificações.
- **Agentes** e **Organizações** — telas reservadas para a equipe de atendimento e para as empresas atendidas (ainda em construção; por enquanto mostram só o título).
- **Gerenciamento de acessos (admin)** — criar, editar, ativar/desativar e excluir usuários, além de redefinir senhas.
- **Login com JWT** — com troca de senha obrigatória no primeiro acesso quando o administrador redefine a senha de alguém, e edição do próprio perfil.

> Os usuários e o login usam um banco SQLite real (`server/database.sqlite`). Conversas, agentes e organizações ainda usam dados de exemplo (`src/mockData.ts`).

## Tecnologias

- **Frontend:** React 19 + Vite + Tailwind CSS + Motion + Lucide
- **Backend:** Express (TypeScript, executado com `tsx`)
- **Banco:** SQLite com `better-sqlite3`
- **Autenticação:** `jsonwebtoken` + `bcryptjs`

## Estrutura

```
server.ts          Servidor Express (API + frontend)
server/
├── db.ts          Conexão SQLite e criação da tabela de usuários
├── auth.ts        Rotas /api/auth (login, primeiro acesso, /me)
└── users.ts       Rotas /api/users (perfil e administração de usuários)
src/
├── views/         Telas: Support, Agents, Organizations, Admin
├── components/    Login, notificações, perfil
└── contexts/      AuthContext (sessão do usuário)
```

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Na primeira execução é criado um usuário administrador padrão: **usuário `admin`, senha `1234`**. Troque essa senha antes de usar o sistema fora do ambiente local.

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta do servidor (padrão `3000`) |
| `JWT_SECRET` | Segredo para assinar os tokens. **Defina em produção** — sem ela é usado um valor padrão do código |
| `NODE_ENV` | Use `production` para servir o build de `dist/` |

### Produção

```bash
npm run build
NODE_ENV=production npx tsx server.ts
```
