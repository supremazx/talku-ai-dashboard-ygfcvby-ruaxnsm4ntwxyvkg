import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Radio, Building2, Clock, ShieldAlert, Zap, PlayCircle, BarChart3, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlobalCall } from '@shared/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export default function AdminLiveCallsPage() {
  const queryClient = useQueryClient();
  const { data: liveCalls, isLoading } = useQuery({
    queryKey: ['admin-calls-live'],
    queryFn: () => api<{ items: GlobalCall[], stats?: any }>('/api/admin/calls/live'),
    refetchInterval: 2000,
  });
  const simulateCall = useMutation({
    mutationFn: () => api('/api/admin/simulate-call', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calls-live'] });
      toast.success('Simulation session initiated');
    }
  });
  const latencyData = [
    { stage: 'STT', avg: 142, p95: 210 },
    { stage: 'LLM', avg: 850, p95: 1200 },
    { stage: 'TTS', avg: 410, p95: 580 },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-orange-600" />
              Global Live Monitor
            </h1>
            <p className="text-muted-foreground">Real-time infrastructure-wide telephony traffic surveillance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={() => simulateCall.mutate()}
              disabled={simulateCall.isPending}
            >
              <PlayCircle className="h-4 w-4" />
              Simulate Traffic
            </Button>
            <div className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border px-4 py-2 rounded-lg flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold">STT Health</span>
              <span className="text-lg font-bold">99.9%</span>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-muted/40 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Pipeline Latency Distribution (ms)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis dataKey="stage" type="category" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="avg" fill="#ea580c" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="p95" fill="#f9731640" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-muted/40 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Provider Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase font-bold tracking-tighter">MediaSFU</span>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 h-4 px-1">99.9%</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase font-bold tracking-tighter">OpenAI Realtime</span>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 h-4 px-1">99.2%</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase font-bold tracking-tighter">ElevenLabs V2</span>
                <Badge variant="outline" className="text-amber-500 border-amber-500/20 h-4 px-1">87.5%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Tenant Context</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Latencies (ms)</TableHead>
                <TableHead>Provider Path</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead className="text-right">Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20">Syncing with MediaSFU Clusters...</TableCell></TableRow>
                ) : (liveCalls?.items || []).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No global traffic detected.</TableCell></TableRow>
                ) : (
                  (liveCalls?.items || []).map((call) => (
                    <motion.tr
                      key={call.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="hover:bg-muted/20"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-600" />
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold truncate max-w-[120px]">{call.tenantId}</span>
                            <span className="text-[10px] text-muted-foreground">{call.fromNumber}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{call.id.slice(0, 12)}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-mono",
                            call.metadata.latencies.stt_ms < 500 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            STT: {call.metadata.latencies.stt_ms || 140}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-mono",
                            call.metadata.latencies.llm_ms < 1000 ? "text-emerald-600" : "text-amber-600"
                          )}>
                            LLM: {call.metadata.latencies.llm_ms || 840}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 items-center">
                          <Zap className="h-3 w-3 text-orange-500" />
                          <span className="text-[10px] uppercase font-bold tracking-tighter">{call.metadata.provider || 'openai'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {Math.floor((Date.now() - call.startTime) / 1000)}s
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50">
                          <ShieldAlert className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}