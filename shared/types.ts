export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type VoiceProvider = 'elevenlabs' | 'openai' | 'deepgram';
export type CallStatus = 'completed' | 'ongoing' | 'failed' | 'no-answer';
export type MediaSFUStatus = 'initiating' | 'ringing' | 'connected' | 'ended' | 'recording';
export type MediaSFUEvent =
  | 'call.started'
  | 'call.answered'
  | 'stt.partial'
  | 'llm.response'
  | 'tts.played'
  | 'recording.saved'
  | 'call.ended';
export interface MediaSFUMetadata {
  sessionId: string;
  recordingUrl?: string;
  latencies: {
    stt_ms: number;
    llm_ms: number;
    tts_ms: number;
  };
  provider: VoiceProvider;
}
export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    day: number; // 0-6
    start: string; // HH:mm
    end: string; // HH:mm
    closed: boolean;
  }[];
}
export interface RoutingRules {
  officeHours: BusinessHours;
  fallbackNumber: string;
  inboundTimeout: number; // seconds
}
export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'pending' | 'restricted';
  credits: number;
  limits: {
    concurrency: number;
    maxDuration: number;
  };
  metrics: {
    calls30d: number;
    minutes30d: number;
    spend30d: number;
  };
  createdAt: number;
}
export interface Agent {
  id: string;
  tenantId: string;
  name: string;
  prompt: string;
  voice: string;
  language: string;
  provider: VoiceProvider;
  temperature: number;
}
export interface PhoneNumber {
  id: string;
  e164: string;
  country: string;
  agentId: string | null;
  tenantId: string;
  status: 'active' | 'pending' | 'released';
  routingRules: RoutingRules;
}
export interface GlobalCall {
  id: string;
  tenantId: string;
  agentId: string;
  fromNumber: string;
  toNumber: string;
  startTime: number;
  duration: number; // seconds
  cost: number;
  margin: number;
  status: CallStatus;
  mediasfu_status: MediaSFUStatus;
  is_live: boolean;
  metadata: MediaSFUMetadata;
  providerStatuses: {
    stt: 'ok' | 'error';
    llm: 'ok' | 'error';
    tts: 'ok' | 'error';
  };
  transcript: { role: 'agent' | 'user'; text: string; ts: number }[];
}
export type CallSession = GlobalCall;
export interface BillingRecord {
  id: string;
  ts: number;
  description: string;
  type: 'top-up' | 'usage' | 'subscription' | 'refund';
  amount: number;
  tenantId: string;
}
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  tenantId: string | null;
  action: string;
  reason: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  payload?: any;
}
export interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tenantId: string | null;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  createdAt: number;
}
export interface DashboardStats {
  totalActiveTenants: number;
  globalCallVolume: { date: string; count: number }[];
  totalNetMargin: number;
  activeIncidents: number;
  totalCalls24h: number;
  revenue24h: number;
}
export interface ProviderMetric {
  provider: VoiceProvider;
  volume: number;
  latency: number;
  errorRate: number;
}
export interface User { id: string; name: string; }
export interface InternalUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'support' | 'finance' | 'read-only';
  lastLogin: number;
}