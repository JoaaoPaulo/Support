import { Agent, Organization, Conversation, ConversationStatus, MessageStatus } from './types';

export const MOCK_AGENTS: Agent[] = [
  { 
    id: '1', 
    name: 'João', 
    email: 'joao@support.com', 
    avatar: 'https://i.pravatar.cc/150?u=joao_agent', 
    active: true,
    notifications: { newCall: true, closedCall: true, assignedToMe: true, participations: true }
  },
  { 
    id: '2', 
    name: 'Douglas', 
    email: 'douglas@support.com', 
    avatar: 'https://i.pravatar.cc/150?u=douglas', 
    active: true,
    notifications: { newCall: true, closedCall: false, assignedToMe: true, participations: true }
  },
  { 
    id: '3', 
    name: 'Joshua', 
    email: 'joshua@support.com', 
    avatar: 'https://i.pravatar.cc/150?u=joshua', 
    active: true,
    notifications: { newCall: false, closedCall: false, assignedToMe: true, participations: false }
  },
];

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org1', name: 'Afiliados', domain: 'afiliados.com', active: true },
  { id: 'org2', name: 'Barber', domain: 'barber.com', active: true },
  { id: 'org3', name: 'Conekto', domain: 'conekto.com', active: true },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    customerName: 'João Pereira',
    customerAvatar: 'https://i.pravatar.cc/150?u=joao',
    assignedAgentId: '1',
    organizationId: 'org1',
    status: ConversationStatus.OPEN,
    lastMessage: 'Olá, gostaria de saber o status do meu pedido.',
    lastMessageTime: '10:30',
    messages: [
      { id: 'm1', text: 'Olá, gostaria de saber o status do meu pedido.', sender: 'customer', timestamp: '10:30' }
    ]
  },
  {
    id: 'c2',
    customerName: 'Maria Santos',
    customerAvatar: 'https://i.pravatar.cc/150?u=maria',
    assignedAgentId: '2',
    organizationId: 'org2',
    status: ConversationStatus.OPEN,
    lastMessage: 'O tamanho M ainda está disponível?',
    lastMessageTime: '09:15',
    messages: [
      { id: 'm2', text: 'O tamanho M ainda está disponível?', sender: 'customer', timestamp: '09:15' }
    ]
  },
  {
    id: 'c3',
    customerName: 'Ricardo Lima',
    customerAvatar: 'https://i.pravatar.cc/150?u=ricardo',
    assignedAgentId: '1',
    organizationId: 'org3',
    status: ConversationStatus.CLOSED,
    lastMessage: 'Obrigado pela ajuda!',
    lastMessageTime: 'Ontem',
    messages: [
      { id: 'm3', text: 'Obrigado pela ajuda!', sender: 'customer', timestamp: 'Ontem', status: MessageStatus.READ }
    ]
  },
  {
    id: 'c4',
    customerName: 'Ana Clara',
    customerAvatar: 'https://i.pravatar.cc/150?u=ana',
    assignedAgentId: '3',
    organizationId: 'org1',
    status: ConversationStatus.OPEN,
    lastMessage: 'Meu cupom não está funcionando.',
    lastMessageTime: '11:45',
    messages: [
      { id: 'm4', text: 'Meu cupom não está funcionando.', sender: 'customer', timestamp: '11:45' }
    ]
  },
  {
    id: 'c5',
    customerName: 'Bruno Silva',
    customerAvatar: 'https://i.pravatar.cc/150?u=bruno',
    assignedAgentId: '2',
    organizationId: 'org2',
    status: ConversationStatus.OPEN,
    lastMessage: 'Qual o prazo de entrega para o CEP 01001-000?',
    lastMessageTime: '12:10',
    messages: [
      { id: 'm5', text: 'Qual o prazo de entrega para o CEP 01001-000?', sender: 'customer', timestamp: '12:10' }
    ]
  },
  {
    id: 'c6',
    customerName: 'Carla Souza',
    customerAvatar: 'https://i.pravatar.cc/150?u=carla',
    assignedAgentId: '3',
    organizationId: 'org3',
    status: ConversationStatus.OPEN,
    lastMessage: 'Preciso cancelar minha assinatura.',
    lastMessageTime: '13:05',
    messages: [
      { id: 'm6', text: 'Preciso cancelar minha assinatura.', sender: 'customer', timestamp: '13:05' }
    ]
  }
];
