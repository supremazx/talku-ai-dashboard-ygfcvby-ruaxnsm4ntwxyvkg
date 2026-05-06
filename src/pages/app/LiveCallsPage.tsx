import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Radio, PhoneIncoming, Clock, Bot, MoreVertical, Info, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useTenantStore } from '@/lib/tenant-store';
import { GlobalCall } from '@shared/types';
import { cn } from '@/lib/utils';
export default function LiveCallsPage() {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const { data: liveCalls, isLoading } = useQuery({
    queryKey: ['app-calls-live', activeTenantId],
    queryFn: () => api<{ items: GlobalCall[] }>('/api/app/calls/live', {
      headers: { 'X-Tenant-Id': activeTenantId }
    }),
    refetchInterval: 3000,
  });
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Live Activity</h1>
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 flex gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground">Real-time monitoring of currently active AI sessions.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border shadow-sm">
            <Radio className="h-4 w-4 text-orange-600 animate-pulse" />
            <span className="text-sm font-bold">{liveCalls?.items?.length || 0} Concurrent Sessions</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Caller</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[250px]">Live Transcript Stream</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 animate-pulse">Establishing secure connection...</TableCell></TableRow>
              ) : (liveCalls?.items || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <PhoneIncoming className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">Waiting for inbound traffic...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                (liveCalls?.items || []).map((call) => (
                  <TableRow key={call.id} className="group border-l-4 border-l-orange-500/50 hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-sm">{call.fromNumber}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{call.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-orange-100 dark:bg-orange-950/20">
                          <Bot className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-xs font-semibold">Voice Persona</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-mono bg-muted/30 px-2 py-1 rounded w-fit">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {Math.floor((Date.now() - call.startTime) / 1000)}s
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[9px] uppercase font-bold px-1.5 py-0",
                        call.mediasfu_status === 'connected' ? "bg-emerald-500" : "bg-orange-500"
                      )}>
                        {call.mediasfu_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[300px]">
                        {call.transcript.slice(-2).map((t, idx) => (
                          <div key={idx} className={cn(
                            "text-[10px] px-2 py-1 rounded-md line-clamp-1",
                            t.role === 'agent' ? "bg-orange-50 text-orange-800 border border-orange-100" : "bg-muted text-muted-foreground"
                          )}>
                            {t.text}
                          </div>
                        ))}
                        {call.transcript.length === 0 && <span className="text-[10px] italic text-muted-foreground">Synchronizing stream...</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2"><Info className="h-3.5 w-3.5" /> View Metadata</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-rose-600"><AlertCircle className="h-3.5 w-3.5" /> Flag for Review</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs text-muted-foreground pointer-events-none">SID: {call.id}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}