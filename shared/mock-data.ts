import { InternalUser, Tenant, GlobalCall, AuditLog, Incident, BillingRecord } from './types';
export const MOCK_INTERNAL_USERS: InternalUser[] = [
  { id: 'admin-1', email: 'alex@talku.ai', name: 'Alex Rivera', role: 'owner', lastLogin: Date.now() - 10000 },
  { id: 'admin-2', email: 'sam@talku.ai', name: 'Sam Smith', role: 'admin', lastLogin: Date.now() - 50000 },
  { id: 'admin-3', email: 'support@talku.ai', name: 'Support Bot', role: 'support', lastLogin: Date.now() - 5000 },
  { id: 'admin-4', email: 'finance@talku.ai', name: 'Fin Manager', role: 'finance', lastLogin: Date.now() - 90000 },
  { id: 'admin-5', email: 'viewer@talku.ai', name: 'Auditor One', role: 'read-only', lastLogin: Date.now() - 120000 },
];
export const MOCK_TENANTS: Tenant[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `tenant-${i + 1}`,
  name: ['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella', 'Hooli', 'Pied Piper', 'Stark Ind'][i % 8] + ` ${i + 1}`,
  plan: i === 0 ? 'enterprise' : i < 5 ? 'pro' : 'free',
  status: i === 10 ? 'suspended' : 'active',
  credits: Math.floor(Math.random() * 5000),
  limits: { concurrency: 10 * (i + 1), maxDuration: 3600 },
  metrics: {
    calls30d: Math.floor(Math.random() * 10000),
    minutes30d: Math.floor(Math.random() * 50000),
    spend30d: Math.floor(Math.random() * 2000),
  },
  createdAt: Date.now() - (i * 86400000 * 2),
}));
export const MOCK_CALLS: GlobalCall[] = Array.from({ length: 100 }).map((_, i) => {
  const tenant = MOCK_TENANTS[i % MOCK_TENANTS.length];
  const duration = Math.floor(Math.random() * 600) + 30;
  const cost = Number((duration * 0.015).toFixed(4));
  const margin = Number((cost * 0.4).toFixed(4));
  const sessionId = `sess-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: `call-${i}`,
    tenantId: tenant.id,
    agentId: `agent-${i % 3}`,
    fromNumber: `+1555000${1000 + i}`,
    toNumber: `+1888123${2000 + i}`,
    startTime: Date.now() - (i * 1800000),
    duration,
    cost,
    margin,
    status: i % 15 === 0 ? 'failed' : 'completed',
    mediasfu_status: 'ended',
    is_live: false,
    metadata: {
      sessionId,
      latencies: { stt_ms: 120, llm_ms: 850, tts_ms: 400 },
      provider: 'openai'
    },
    providerStatuses: {
      stt: 'ok',
      llm: i % 20 === 0 ? 'error' : 'ok',
      tts: 'ok',
    },
    transcript: [
      { role: 'agent', text: 'Hello, Talku support. How can I assist you today?', ts: 1000 },
      { role: 'user', text: 'I need to check the status of my recent package delivery.', ts: 5000 },
      { role: 'agent', text: 'I can certainly help with that. Do you have your tracking number ready?', ts: 8000 }
    ]
  };
});
export const MOCK_AUDIT_LOGS: AuditLog[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `audit-${i}`,
  actorId: MOCK_INTERNAL_USERS[i % 5].id,
  actorName: MOCK_INTERNAL_USERS[i % 5].name,
  tenantId: MOCK_TENANTS[i % 20].id,
  action: ['CREDIT_ADJUST', 'TENANT_SUSPENDED', 'API_KEY_RESET', 'PLAN_UPGRADE', 'AGENT_DELETED', 'SYSTEM_UPDATE'][i % 6],
  reason: 'Automated policy enforcement or manual admin request via ticket #' + (4412 + i),
  timestamp: Date.now() - (i * 3600000 * 4),
  severity: i % 10 === 0 ? 'high' : 'medium',
  payload: {
    before: { status: 'active', credits: 100 },
    after: { status: i % 6 === 1 ? 'suspended' : 'active', credits: 500 }
  }
}));
export const MOCK_INCIDENTS: Incident[] = [
  { id: 'inc-1', type: 'provider_latency', severity: 'high', tenantId: null, status: 'investigating', description: 'ElevenLabs latency spike in US-East affecting 40% of calls.', createdAt: Date.now() - 3600000 },
  { id: 'inc-2', type: 'abuse_spike', severity: 'medium', tenantId: 'tenant-5', status: 'open', description: 'Concurrent call limit reached for Tenant-5. Possible loop detected.', createdAt: Date.now() - 1800000 }
];
export const MOCK_BILLING_RECORDS: BillingRecord[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `bill-rec-${i}`,
  ts: Date.now() - (i * 86400000 * 0.5),
  description: i % 5 === 0 ? 'Credit Top-up' : 'Call Usage Batch',
  type: i % 5 === 0 ? 'top-up' : 'usage',
  amount: i % 5 === 0 ? 100.00 : -Math.random() * 20,
  tenantId: MOCK_TENANTS[i % 10].id
}));
export const MOCK_USERS = [{ id: 'u1', name: 'Admin User' }];
export const MOCK_CHATS = [];
export const MOCK_CHAT_MESSAGES = [];