import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { History, Eye, Download, Search, Activity, Filter, Clock, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { GlobalCall } from '@shared/types';
import { cn } from '@/lib/utils';
import { useTenantStore } from '@/lib/tenant-store';
export default function CallLogsPage() {
  const location = useLocation();
  const [selectedCall, setSelectedCall] = useState<GlobalCall | null>(null);
  const [search, setSearch] = useState('');
  const isAdmin = location.pathname.startsWith('/admin');
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const { data: calls, isLoading } = useQuery({
    queryKey: [isAdmin ? 'admin-calls' : 'app-calls', activeTenantId],
    queryFn: () => {
      const endpoint = isAdmin ? '/api/calls' : '/api/app/calls';
      const headers = isAdmin ? {} : { 'X-Tenant-Id': activeTenantId };
      return api<{ items: GlobalCall[] }>(endpoint, { headers });
    }
  });
  const filteredCalls = (calls?.items || []).filter(c => 
    c.fromNumber.includes(search) || c.toNumber.includes(search) || c.id.includes(search)
  );
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? "Platform Session Intelligence" : "Call History"}
            </h1>
            <p className="text-muted-foreground">
              Detailed audit trail of all voice AI interactions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            {isAdmin && <Badge className="bg-orange-600 shadow-lg">Infrastructure View</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9 bg-muted/30 border-muted-foreground/10" 
              placeholder="Search session IDs or E.164 numbers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[140px]">Timestamp</TableHead>
                {isAdmin && <TableHead className="w-[100px]">Tenant</TableHead>}
                <TableHead>Session Context</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{isAdmin ? "Net Margin" : "Cost"}</TableHead>
                <TableHead className="text-right pr-6">Analyze</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-20 animate-pulse">Scanning ledger...</TableCell></TableRow>
              ) : filteredCalls.length === 0 ? (
                <TableRow><TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-20 text-muted-foreground italic">No sessions matched your criteria.</TableCell></TableRow>
              ) : (
                filteredCalls.map((call) => (
                  <TableRow key={call.id} className="hover:bg-muted/30 group">
                    <TableCell className="text-[10px] font-mono leading-tight whitespace-nowrap text-muted-foreground">
                      {format(new Date(call.startTime), 'MM/dd HH:mm:ss')}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-mono tracking-tighter truncate max-w-[80px]">
                          {call.tenantId}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-col text-[11px] font-mono">
                        <span className={cn("font-bold", search && call.fromNumber.includes(search) ? "text-orange-600" : "text-primary")}>
                          {call.fromNumber}
                        </span>
                        <span className="text-muted-foreground text-[9px] truncate max-w-[120px]">AGENT: {call.agentId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{Math.floor(call.duration / 60)}m {call.duration % 60}s</TableCell>
                    <TableCell>
                      <Badge variant={call.status === 'completed' ? 'secondary' : 'destructive'} className="text-[9px] uppercase px-1.5 py-0">
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-xs font-mono font-bold text-right",
                      isAdmin ? "text-emerald-600" : "text-primary"
                    )}>
                      {isAdmin ? `+${call.margin.toFixed(3)}` : `-${call.cost.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCall(call)} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4 text-orange-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Sheet open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-orange-600" />
                Session Intelligence
              </SheetTitle>
              <SheetDescription className="font-mono text-[10px] truncate">{selectedCall?.id}</SheetDescription>
            </SheetHeader>
            {selectedCall && (
              <div className="mt-8 space-y-8 animate-slide-up">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Zap className="h-3 w-3 text-orange-500" /> Pipeline</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]"><span>STT</span><span className="font-bold">{selectedCall.metadata.latencies.stt_ms}ms</span></div>
                      <div className="flex justify-between text-[10px]"><span>LLM</span><span className="font-bold">{selectedCall.metadata.latencies.llm_ms}ms</span></div>
                      <div className="flex justify-between text-[10px]"><span>TTS</span><span className="font-bold">{selectedCall.metadata.latencies.tts_ms}ms</span></div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Activity className="h-3 w-3 text-blue-500" /> Stats</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]"><span>Duration</span><span className="font-bold">{selectedCall.duration}s</span></div>
                      <div className="flex justify-between text-[10px]"><span>Provider</span><span className="font-bold uppercase">{selectedCall.metadata.provider}</span></div>
                      <div className="flex justify-between text-[10px]"><span>Health</span><span className="text-emerald-600 font-bold">100%</span></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1">Conversation Ledger</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCall.transcript.map((msg, i) => (
                      <div key={i} className={cn("flex flex-col gap-1", msg.role === 'agent' ? "items-start" : "items-end")}>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground px-2">{msg.role}</span>
                        <div className={cn(
                          "text-xs p-3 rounded-2xl max-w-[85%] leading-relaxed",
                          msg.role === 'agent' ? "bg-orange-50 border border-orange-100 rounded-tl-none text-primary" : "bg-muted rounded-tr-none text-muted-foreground"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t flex gap-3">
                  <Button variant="outline" className="flex-1 text-xs font-bold">Trace Metadata</Button>
                  <Button className="flex-1 text-xs font-bold btn-gradient">Open Ticket</Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}