import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Wallet, TrendingUp, Download, Receipt, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BillingRecord } from '@shared/types';
import { format } from 'date-fns';
import { useTenantStore } from '@/lib/tenant-store';
const sparklineData = [
  { val: 10 }, { val: 25 }, { val: 15 }, { val: 35 }, { val: 20 }, { val: 45 }, { val: 30 }
];
export default function BillingPage() {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const { data: records, isLoading } = useQuery({
    queryKey: ['billing', activeTenantId],
    queryFn: () => api<{ items: BillingRecord[] }>('/api/billing', {
      headers: { 'X-Tenant-Id': activeTenantId }
    })
  });
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
            <p className="text-muted-foreground">Manage your credits and view consumption history.</p>
          </div>
          <Button className="btn-gradient shadow-lg">
            <CreditCard className="mr-2 h-4 w-4" /> Add Credits
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-slate-950 text-white shadow-xl border-none relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform">
              <Wallet className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Available Balance
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-4xl font-bold">$124.50</div>
                <div className="h-10 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-muted/40 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Est. Month Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.45</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                <TrendingUp className="h-3 w-3" /> 5% LOWER THAN LAST MONTH
              </div>
            </CardContent>
          </Card>
          <Card className="border-muted/40 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inbound Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">$2.00 / MONTH EACH</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" />
              Ledger History
            </h3>
            <Button variant="outline" size="sm" className="h-8 text-xs font-bold">
              <Download className="h-3.5 w-3.5 mr-2" /> Export CSV
            </Button>
          </div>
          <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 animate-pulse">Accessing financial ledger...</TableCell></TableRow>
                ) : (records?.items || []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">No transactions found in this workspace.</TableCell></TableRow>
                ) : (
                  records?.items.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/10">
                      <TableCell className="text-xs text-muted-foreground font-mono">{format(record.ts, 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-semibold text-sm">{record.description}</TableCell>
                      <TableCell>
                        <Badge variant={record.type === 'top-up' ? 'secondary' : 'outline'} className="capitalize text-[9px] font-bold">
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold text-sm ${record.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {record.amount < 0 ? '' : '+'}${Math.abs(record.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}