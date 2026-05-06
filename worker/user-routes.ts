import { Hono } from "hono";
import type { Env } from './core-utils';
import {
  TenantEntity,
  CallSessionEntity,
  AgentEntity,
  PhoneNumberEntity,
  AuditLogEntity,
  IncidentEntity
} from "./entities";
import { ok, bad, notFound, Index } from './core-utils';
import type { GlobalCall, MediaSFUEvent } from "../shared/types";
import { MOCK_BILLING_RECORDS } from "../shared/mock-data";
console.log("[WORKER] Initializing user routes...");
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  try {
    const getTenantId = (c: any) => c.req.header('X-Tenant-Id') || 'tenant-1';
    // --- INTEGRATIONS ---
    app.get('/api/admin/integrations/status', async (c) => {
      return ok(c, {
        mediasfu: 'online',
        openai: 'online',
        elevenlabs: 'online',
        deepgram: 'online',
        regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
      });
    });
    // --- MEDIASFU WEBHOOKS ---
    app.post('/api/webhooks/mediasfu', async (c) => {
      const payload = await c.req.json() as {
        event: MediaSFUEvent;
        sessionId: string;
        tenantId: string;
        data: any;
        ts: number;
      };
      if (!payload.sessionId) return bad(c, 'Missing sessionId');
      const inst = new CallSessionEntity(c.env, payload.sessionId);
      let state: GlobalCall;
      try {
        if (await inst.exists()) {
          state = await inst.getState();
        } else {
          state = {
            ...CallSessionEntity.initialState,
            id: payload.sessionId,
            tenantId: payload.tenantId || 'tenant-1',
            startTime: payload.ts || Date.now(),
            is_live: true,
            mediasfu_status: 'initiating',
            metadata: {
              ...CallSessionEntity.initialState.metadata,
              sessionId: payload.sessionId
            }
          };
        }
        switch (payload.event) {
          case 'call.started':
            state.mediasfu_status = 'ringing';
            break;
          case 'call.answered':
            state.mediasfu_status = 'connected';
            break;
          case 'stt.partial':
          case 'llm.response':
            if (payload.data?.text) {
              state.transcript.push({
                role: payload.event === 'stt.partial' ? 'user' : 'agent',
                text: payload.data.text,
                ts: payload.ts || Date.now()
              });
            }
            break;
          case 'call.ended':
            state.mediasfu_status = 'ended';
            state.is_live = false;
            state.status = 'completed';
            state.duration = Math.floor(((payload.ts || Date.now()) - state.startTime) / 1000);
            state.cost = state.duration * 0.015;
            state.margin = state.cost * 0.4;
            break;
        }
        await inst.save(state);
        return ok(c, { received: true, sid: payload.sessionId });
      } catch (err) {
        console.error(`[WORKER] MediaSFU Webhook error: ${err}`);
        return bad(c, 'Internal processing error');
      }
    });
    // --- SIMULATION ---
    app.post('/api/admin/simulate-call', async (c) => {
      const sessionId = `sim-${crypto.randomUUID().slice(0, 8)}`;
      const tenantId = 'tenant-1';
      try {
        const call: GlobalCall = {
          ...CallSessionEntity.initialState,
          id: sessionId,
          tenantId,
          agentId: 'agent-1',
          fromNumber: '+1555' + Math.floor(Math.random() * 9000000 + 1000000),
          toNumber: '+1888' + Math.floor(Math.random() * 9000000 + 1000000),
          startTime: Date.now(),
          is_live: true,
          status: 'ongoing',
          mediasfu_status: 'connected',
          metadata: {
            ...CallSessionEntity.initialState.metadata,
            sessionId,
            latencies: { stt_ms: 120, llm_ms: 840, tts_ms: 390 }
          },
          providerStatuses: {
            stt: 'ok',
            llm: 'ok',
            tts: 'ok'
          },
          transcript: [{ 
            role: 'agent', 
            text: 'Talku.ai Global Node Online. Session established.', 
            ts: Date.now() 
          }]
        };
        await new CallSessionEntity(c.env, sessionId).save(call);
        const idx = new Index<string>(c.env, 'call-sessions');
        await idx.add(sessionId);
        return ok(c, call);
      } catch (err) {
        console.error(`[WORKER] Simulation failed: ${err}`);
        return bad(c, `Simulation failed: ${err}`);
      }
    });
    // --- API ROUTES ---
    app.get('/api/app/calls/live', async (c) => {
      const tenantId = getTenantId(c);
      const active = await CallSessionEntity.listActive(c.env) || [];
      return ok(c, { items: active.filter(cl => cl.tenantId === tenantId) });
    });
    app.get('/api/admin/calls/live', async (c) => {
      const active = await CallSessionEntity.listActive(c.env) || [];
      return ok(c, { items: active });
    });
    app.get('/api/app/agents', async (c) => {
      const tenantId = getTenantId(c);
      const list = await AgentEntity.list(c.env);
      return ok(c, { items: list?.items?.filter(a => a.tenantId === tenantId) || [] });
    });
    app.post('/api/app/agents', async (c) => {
      const tenantId = getTenantId(c);
      const body = await c.req.json();
      const created = await AgentEntity.create(c.env, {
        ...AgentEntity.initialState,
        ...body,
        id: crypto.randomUUID(),
        tenantId
      });
      return ok(c, created);
    });
    app.get('/api/app/numbers', async (c) => {
      const tenantId = getTenantId(c);
      const list = await PhoneNumberEntity.list(c.env);
      return ok(c, { items: list?.items?.filter(n => n.tenantId === tenantId) || [] });
    });
    app.get('/api/billing', async (c) => {
      const tenantId = getTenantId(c);
      const isAdmin = !c.req.path.includes('/app/');
      if (isAdmin) return ok(c, { items: MOCK_BILLING_RECORDS });
      return ok(c, { items: MOCK_BILLING_RECORDS.filter(r => r.tenantId === tenantId) });
    });
    app.get('/api/admin/stats', async (c) => {
      const tenants = await TenantEntity.list(c.env);
      return ok(c, {
        totalActiveTenants: tenants?.items?.filter(t => t.status === 'active').length || 0,
        globalCallVolume: Array.from({ length: 7 }).map((_, i) => ({
          date: `05-${10 + i}`,
          count: Math.floor(Math.random() * 50) + 10
        })),
        totalNetMargin: 420.50,
        activeIncidents: 0,
        totalCalls24h: 150,
        revenue24h: 240.00
      });
    });
    app.get('/api/admin/tenants', async (c) => {
      const tenants = await TenantEntity.list(c.env);
      return ok(c, tenants || { items: [] });
    });
    app.get('/api/admin/audit-logs', async (c) => {
      const logs = await AuditLogEntity.list(c.env);
      return ok(c, logs || { items: [] });
    });
    app.get('/api/admin/incidents', async (c) => {
      const incidents = await IncidentEntity.list(c.env);
      return ok(c, incidents || { items: [] });
    });
    app.get('/api/admin/usage-stats', async (c) => {
      return ok(c, {
        providers: [
          { provider: 'openai', volume: 1000, latency: 850, errorRate: 0.01 },
          { provider: 'elevenlabs', volume: 800, latency: 420, errorRate: 0.02 },
          { provider: 'deepgram', volume: 600, latency: 150, errorRate: 0.005 }
        ]
      });
    });
    app.get('/api/app/calls', async (c) => {
      const tenantId = getTenantId(c);
      const list = await CallSessionEntity.list(c.env);
      return ok(c, { items: list?.items?.filter(cl => cl.tenantId === tenantId) || [] });
    });
    app.get('/api/calls', async (c) => {
      const list = await CallSessionEntity.list(c.env);
      return ok(c, list || { items: [] });
    });
  } catch (error) {
    console.error("[WORKER CRITICAL] Failed to initialize userRoutes:", error);
  }
}