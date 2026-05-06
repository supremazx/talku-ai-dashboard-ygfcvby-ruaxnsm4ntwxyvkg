import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mic, History, Wallet, Bot, TrendingUp, PhoneIncoming, Plus, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlobalCall, Tenant } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTenantStore } from '@/lib/tenant-store';
export function DashboardPage() {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const activeTenant = useTenantStore((s) => s.activeTenant);
  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ['app-calls', activeTenantId],
    queryFn: () => api<{ items: GlobalCall[] }>('/api/app/calls', {
      headers: { 'X-Tenant-Id': activeTenantId }
    })
  });
  const { data: tenantsData } = useQuery({
    queryKey: ['available-tenants'],
    queryFn: () => api<{ items: Tenant[] }>('/api/admin/tenants')
  });
  const tenant = activeTenant ?? tenantsData?.items.find(t => t.id === activeTenantId);
  const chartData = [
    { name: 'Mon', count: 45 },
    { name: 'Tue', count: 52 },
    { name: 'Wed', count: 48 },
    { name: 'Thu', count: 61 },
    { name: 'Fri', count: 75 },
    { name: 'Sat', count: 32 },
    { name: 'Sun', count: 28 },
  ];
  if (callsLoading) {
    return (
      <AppLayout container>
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {tenant?.name || 'Workspace'}
            </h1>
            <p className="text-muted-foreground">Real-time command center for your voice AI infrastructure.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/agents"><Plus className="h-4 w-4 mr-2" /> New Agent</Link>
            </Button>
            <Button size="sm" className="btn-gradient" asChild>
              <Link to="/app/billing"><Zap className="h-4 w-4 mr-2" /> Refill Credits</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Sessions (24h)" 
            value={calls?.items.filter(c => c.startTime > Date.now() - 86400000).length.toString() || "0"} 
            icon={PhoneIncoming} 
            trend="+12% from yesterday" 
          />
          <StatCard 
            title="Connected Agents" 
            value={(tenant?.limits.concurrency || 0).toString()} 
            icon={Bot} 
            subtitle="Concurrency Limit"
          />
          <StatCard 
            title="Total Usage" 
            value={`${(tenant?.metrics.minutes30d || 0).toLocaleString()}m`} 
            icon={Mic} 
            subtitle="Last 30 Days"
          />
          <StatCard 
            title="Account Balance" 
            value={`$${tenant?.credits.toFixed(2) || "0.00"}`} 
            icon={Wallet} 
            trend={tenant?.credits && tenant.credits < 50 ? "Low Balance" : "Healthy"} 
            trendColor={tenant?.credits && tenant.credits < 50 ? "text-rose-500" : "text-emerald-500"} 
          />
        </div>
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4 shadow-soft border-border/50">
            <CardHeader>
              <CardTitle>Session Traffic</CardTitle>
              <CardDescription>Aggregate call volume over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: '#ea580c' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#ea580c" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="md:col-span-3 shadow-soft border-border/50 flex flex-col">
            <CardHeader className="bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-orange-600" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link to="/app/logs">View All <ChevronRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y overflow-hidden">
                {calls?.items.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground text-xs italic">
                    Waiting for your first call...
                  </div>
                ) : (
                  calls?.items.slice(0, 7).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <p className="text-[11px] font-mono font-bold">{call.fromNumber}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">{format(call.startTime, 'MMM dd, HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={call.status === 'completed' ? 'secondary' : 'destructive'} className="text-[8px] h-4 uppercase px-1 py-0">
                          {call.status}
                        </Badge>
                        <p className="text-[10px] font-bold text-primary mt-1">-${call.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
function StatCard({ title, value, icon: Icon, trend, trendColor = "text-emerald-500", subtitle }: { title: string; value: string; icon: any; trend?: string; trendColor?: string; subtitle?: string }) {
  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
          <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        {trend && (
          <div className={cn("flex items-center gap-1 text-[10px] mt-1 font-bold", trendColor)}>
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}