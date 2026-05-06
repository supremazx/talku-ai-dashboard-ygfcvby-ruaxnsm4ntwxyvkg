import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Shield, Search, Eye, Fingerprint, Calendar, User } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AuditLog } from '@shared/types';
import { cn } from '@/lib/utils';
export default function AuditLogsPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [search, setSearch] = useState('');
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api<{ items: AuditLog[] }>('/api/admin/audit-logs')
  });
  const filtered = (logs?.items ?? []).filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actorName.toLowerCase().includes(search.toLowerCase()) ||
    l.id.includes(search)
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Audit Logs</h1>
          <p className="text-muted-foreground">Immutable history of administrative actions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search by action, actor, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20">Accessing secure logs...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20">No audit records found</TableCell></TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-muted/30">
                    <TableCell className="text-[11px] font-mono whitespace-nowrap">
                      {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium">{log.actorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono bg-muted/50">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-[9px] uppercase px-1 py-0",
                          log.severity === 'high' || log.severity === 'critical' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {log.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-orange-600" />
                Audit Detail
              </DialogTitle>
              <DialogDescription className="font-mono text-[10px]">
                ID: {selectedLog?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Actor</p>
                    <p className="text-sm font-semibold">{selectedLog.actorName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{selectedLog.actorId}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Action Metadata</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" /> {format(selectedLog.timestamp, 'PPpp')}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Reason for action</p>
                  <p className="text-sm italic text-foreground bg-accent/50 p-3 rounded-md border border-accent">
                    "{selectedLog.reason}"
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Payload Diff</p>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-[11px] font-mono overflow-auto max-h-[300px]">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}