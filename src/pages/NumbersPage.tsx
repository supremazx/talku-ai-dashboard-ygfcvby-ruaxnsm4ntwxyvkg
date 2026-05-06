import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Settings2, Plus, Clock, ShieldCheck, Radio, Activity, Hash } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneNumber, Agent, GlobalCall } from '@shared/types';
import { useTenantStore } from '@/lib/tenant-store';
import { toast } from 'sonner';
import { EmptyState } from '@/components/EmptyState';
export default function NumbersPage() {
  const queryClient = useQueryClient();
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const [selectedNum, setSelectedNum] = useState<PhoneNumber | null>(null);
  const { data: numbers, isLoading: numbersLoading } = useQuery({
    queryKey: ['app-numbers', activeTenantId],
    queryFn: () => api<{ items: PhoneNumber[] }>('/api/app/numbers', {
      headers: { 'X-Tenant-Id': activeTenantId }
    })
  });
  const { data: agents } = useQuery({
    queryKey: ['app-agents', activeTenantId],
    queryFn: () => api<{ items: Agent[] }>('/api/app/agents', {
      headers: { 'X-Tenant-Id': activeTenantId }
    })
  });
  const { data: liveCalls } = useQuery({
    queryKey: ['app-calls-live', activeTenantId],
    queryFn: () => api<{ items: GlobalCall[] }>('/api/app/calls/live', {
      headers: { 'X-Tenant-Id': activeTenantId }
    }),
    refetchInterval: 5000,
  });
  const updateNumber = useMutation({
    mutationFn: (updates: Partial<PhoneNumber>) =>
      api<PhoneNumber>(`/api/app/numbers/${selectedNum?.id}`, {
        method: 'PATCH',
        headers: { 'X-Tenant-Id': activeTenantId },
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-numbers'] });
      toast.success('Routing configuration updated');
      setSelectedNum(null);
    }
  });
  const numberList = numbers?.items ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Numbers & Routing</h1>
            <p className="text-muted-foreground">Manage your E.164 telephony inventory and AI mapping.</p>
          </div>
          {numberList.length > 0 && (
            <Button className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" /> Provision Number
            </Button>
          )}
        </div>
        {numbersLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse bg-muted/20 rounded-md" />
            <div className="h-64 w-full animate-pulse bg-muted/20 rounded-xl" />
          </div>
        ) : numberList.length === 0 ? (
          <EmptyState
            icon={Hash}
            title="No Numbers Provisioned"
            description="You need a phone number to receive incoming calls. Provision a number from our global inventory to get started."
            actionLabel="Browse Number Inventory"
            onAction={() => toast.info('Inventory browser coming soon')}
          />
        ) : (
          <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Live Traffic</TableHead>
                  <TableHead>Agent Assignment</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {numberList.map((num) => (
                  <TableRow key={num.id} className="group hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-primary">{num.e164}</TableCell>
                    <TableCell>
                      {liveCalls?.items?.some(c => c.toNumber === num.e164) ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 h-6">
                          <Radio className="h-3 w-3 animate-pulse" /> Active
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-50">
                          <Activity className="h-3 w-3" /> Idle
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={num.agentId ? 'secondary' : 'outline'} className="text-[10px] uppercase h-6">
                        {agents?.items.find(a => a.id === num.agentId)?.name || 'Unassigned'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight h-6">
                        {num.routingRules.officeHours.enabled ? 'Office Hours Only' : '24/7 Availability'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedNum(num)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Sheet open={!!selectedNum} onOpenChange={() => setSelectedNum(null)}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Routing Configuration</SheetTitle>
              <SheetDescription className="font-mono text-xs">Configure how incoming calls to {selectedNum?.e164} are handled.</SheetDescription>
            </SheetHeader>
            {selectedNum && (
              <div className="mt-8 space-y-8">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Primary Destination</h3>
                  <div className="space-y-2">
                    <Label>Assign Agent</Label>
                    <Select
                      defaultValue={selectedNum.agentId || 'none'}
                      onValueChange={(val) => updateNumber.mutate({ agentId: val === 'none' ? null : val })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select an AI Agent" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Hang up)</SelectItem>
                        {agents?.items.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </section>
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Office Hours</h3>
                    <Switch
                      checked={selectedNum.routingRules.officeHours.enabled}
                      onCheckedChange={(val) => updateNumber.mutate({
                        routingRules: { ...selectedNum.routingRules, officeHours: { ...selectedNum.routingRules.officeHours, enabled: val } }
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground italic">Automatic diversion for out-of-hours traffic.</p>
                </section>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}