import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Building2, MoreHorizontal, ShieldAlert, CreditCard, Key, Eye } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tenant } from '@shared/types';
import { toast } from 'sonner';
export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [actionTenant, setActionTenant] = useState<{ tenant: Tenant, action: string } | null>(null);
  const [reason, setReason] = useState('');
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => api<{ items: Tenant[] }>('/api/admin/tenants')
  });
  const updateTenant = useMutation({
    mutationFn: (updates: any) => api(`/api/admin/tenants/${actionTenant?.tenant.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...updates, reason })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      toast.success('Action completed and audited');
      setActionTenant(null);
      setReason('');
    },
    onError: (err: any) => toast.error(err.message)
  });
  const filtered = (tenants?.items ?? []).filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.id.includes(search)
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
            <p className="text-muted-foreground">Manage organization access, limits, and billing states.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search by name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filters</Button>
          <Button className="bg-orange-600 hover:bg-orange-700">Add Tenant</Button>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>30d Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Fetching tenants...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">No tenants found</TableCell></TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-muted/50">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{t.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{t.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'active' ? 'secondary' : 'destructive'} className="capitalize">
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">${t.credits.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium">{t.metrics.calls30d}</span> calls / <span className="font-medium">{t.metrics.minutes30d}</span> min
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2"><CreditCard className="h-3.5 w-3.5" /> Adjust Credits</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 gap-2"
                            onClick={() => setActionTenant({ tenant: t, action: t.status === 'active' ? 'suspend' : 'reactivate' })}
                          >
                            <ShieldAlert className="h-3.5 w-3.5" /> 
                            {t.status === 'active' ? 'Suspend Tenant' : 'Reactivate'}
                          </DropdownMenuItem>
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
      <Dialog open={!!actionTenant} onOpenChange={() => setActionTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionTenant?.action} Tenant</DialogTitle>
            <DialogDescription>
              You are about to {actionTenant?.action} <strong>{actionTenant?.tenant.name}</strong>. This action is tracked in the audit logs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Action</Label>
              <Input 
                id="reason" 
                placeholder="e.g. Terms of service violation, payment failure..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionTenant(null)}>Cancel</Button>
            <Button 
              variant={actionTenant?.action === 'suspend' ? 'destructive' : 'default'}
              disabled={!reason || updateTenant.isPending}
              onClick={() => updateTenant.mutate({ status: actionTenant?.action === 'suspend' ? 'suspended' : 'active' })}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}