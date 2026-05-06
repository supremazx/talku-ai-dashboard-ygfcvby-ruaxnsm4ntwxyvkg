import { IndexedEntity } from "./core-utils";
import type {
  Agent,
  PhoneNumber,
  GlobalCall,
  Tenant,
  InternalUser,
  AuditLog,
  Incident,
  BusinessHours
} from "@shared/types";
import {
  MOCK_TENANTS,
  MOCK_INTERNAL_USERS,
  MOCK_CALLS,
  MOCK_AUDIT_LOGS,
  MOCK_INCIDENTS
} from "@shared/mock-data";
const DEFAULT_HOURS: BusinessHours = {
  enabled: false,
  timezone: "UTC",
  schedule: Array.from({ length: 7 }).map((_, i) => ({
    day: i,
    start: "09:00",
    end: "17:00",
    closed: i === 0 || i === 6
  }))
};
export class TenantEntity extends IndexedEntity<Tenant> {
  static readonly entityName = "tenant";
  static readonly indexName = "tenants";
  static readonly initialState: Tenant = {
    id: "",
    name: "",
    plan: "free",
    status: "active",
    credits: 0,
    limits: { concurrency: 1, maxDuration: 600 },
    metrics: { calls30d: 0, minutes30d: 0, spend30d: 0 },
    createdAt: 0
  };
  static seedData = MOCK_TENANTS;
}
export class PhoneNumberEntity extends IndexedEntity<PhoneNumber> {
  static readonly entityName = "phone-number";
  static readonly indexName = "phone-numbers";
  static readonly initialState: PhoneNumber = {
    id: "",
    e164: "",
    country: "US",
    agentId: null,
    tenantId: "",
    status: "active",
    routingRules: {
      officeHours: DEFAULT_HOURS,
      fallbackNumber: "",
      inboundTimeout: 30
    }
  };
}
export class AgentEntity extends IndexedEntity<Agent> {
  static readonly entityName = "agent";
  static readonly indexName = "agents";
  static readonly initialState: Agent = {
    id: "",
    tenantId: "tenant-1",
    name: "",
    prompt: "",
    voice: "bella",
    language: "en-US",
    provider: "openai",
    temperature: 0.7
  };
}
export class CallSessionEntity extends IndexedEntity<GlobalCall> {
  static readonly entityName = "call-session";
  static readonly indexName = "call-sessions";
  static readonly initialState: GlobalCall = {
    id: "",
    tenantId: "",
    agentId: "",
    fromNumber: "",
    toNumber: "",
    startTime: 0,
    duration: 0,
    cost: 0,
    margin: 0,
    status: "completed",
    mediasfu_status: "ended",
    is_live: false,
    metadata: {
      sessionId: "",
      latencies: { stt_ms: 0, llm_ms: 0, tts_ms: 0 },
      provider: "openai"
    },
    providerStatuses: { stt: 'ok', llm: 'ok', tts: 'ok' },
    transcript: []
  };
  /**
   * Strictly typed active call lookup. 
   * Leverages the IndexedEntity list helper with explicit type safety.
   */
  static async listActive(env: any): Promise<GlobalCall[]> {
    try {
      const list = await CallSessionEntity.list(env);
      if (!list || !list.items) return [];
      return list.items.filter(c => c && c.is_live);
    } catch (err) {
      console.error(`[ENTITY] Failed to list active calls: ${err}`);
      return [];
    }
  }
}
export class AuditLogEntity extends IndexedEntity<AuditLog> {
  static readonly entityName = "audit-log";
  static readonly indexName = "audit-logs";
  static readonly initialState: AuditLog = {
    id: "",
    actorId: "system",
    actorName: "System",
    tenantId: null,
    action: "",
    reason: "",
    timestamp: 0,
    severity: "low"
  };
  static seedData = MOCK_AUDIT_LOGS;
}
export class IncidentEntity extends IndexedEntity<Incident> {
  static readonly entityName = "incident";
  static readonly indexName = "incidents";
  static readonly initialState: Incident = { 
    id: "", 
    type: "api_error", 
    severity: "low", 
    tenantId: null, 
    status: "open", 
    description: "", 
    createdAt: 0 
  };
  static seedData = MOCK_INCIDENTS;
}