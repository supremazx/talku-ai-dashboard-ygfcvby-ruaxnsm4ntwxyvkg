import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Server, AlertCircle, CheckCircle2, ShieldAlert, Cpu, Network, Zap } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Incident, ProviderMetric } from '@shared/types';
import { cn } from '@/lib/utils';
export default function HealthPage() {
  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api<{ items: Incident[] }>('/api/admin/incidents')
  });
  const { data: usageStats } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => api<{ providers: ProviderMetric[] }>('/api/admin/usage-stats')
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Real-time infrastructure and provider monitoring.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {usageStats?.providers.map((p) => (
            <Card key={p.provider} className="border-muted/40 shadow-soft">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full animate-pulse",
                      p.errorRate < 0.02 ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{p.provider}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase">
                    {p.errorRate < 0.02 ? 'Operational' : 'Degraded'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Latency</p>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold font-mono">{p.latency}</span>
                      <span className="text-[10px] text-muted-foreground pb-1">ms</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Error Rate</p>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold font-mono">{(p.errorRate * 100).toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground pb-1">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4 border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Active Incidents
              </CardTitle>
              <CardDescription>Major service interruptions or abuse spikes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents?.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium">All systems green</p>
                  </div>
                ) : (
                  incidents?.items.map((inc) => (
                    <div key={inc.id} className="p-4 rounded-lg border bg-muted/20 flex gap-4">
                      <div className={cn(
                        "mt-1 p-1 rounded-full h-fit",
                        inc.severity === 'high' || inc.severity === 'critical' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold uppercase tracking-tight">{inc.type.replace('_', ' ')}</p>
                          <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">{inc.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{inc.description}</p>
                        <p className="text-[10px] font-mono text-muted-foreground pt-1">{new Date(inc.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-3 border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-500" />
                System Console
              </CardTitle>
              <CardDescription>Lower-level infrastructure heartbeats.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border bg-slate-950 p-4">
                <div className="space-y-2 font-mono text-[10px] text-slate-300">
                  <p className="text-emerald-400">[SYSTEM] GlobalDurableObject heartbeat: OK</p>
                  <p className="text-blue-400">[VITE] Hot Module Replacement active</p>
                  <p className="text-slate-500">2024-05-12 14:02:11 [INFO] Tenant-5 session established</p>
                  <p className="text-slate-500">2024-05-12 14:02:15 [DEBUG] OpenAI call_id: chatcmpl-9231... completed</p>
                  <p className="text-amber-400">2024-05-12 14:02:22 [WARN] ElevenLabs retry attempt 1 for voice_id: bella</p>
                  <p className="text-emerald-400">2024-05-12 14:03:01 [SYSTEM] Metric flush successful</p>
                  <p className="text-slate-500">2024-05-12 14:03:05 [INFO] New Audit record committed: ADMIN_LOGIN</p>
                  <p className="text-slate-500">2024-05-12 14:03:10 [DEBUG] Deepgram stream socket closed gracefully</p>
                  <p className="text-rose-400">2024-05-12 14:03:45 [ERROR] Webhook failure: https://api.tenant-12.com/callback (500)</p>
                  <p className="text-slate-500">2024-05-12 14:04:01 [INFO] Cron: Billing cycle initiated</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}