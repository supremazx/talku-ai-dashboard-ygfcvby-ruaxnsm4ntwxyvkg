import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Activity, DollarSign, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardStats, Incident } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
export function HomePage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<DashboardStats>('/api/admin/stats')
  });
  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => api<{ items: Incident[] }>('/api/admin/incidents')
  });
  if (statsLoading) {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground">Global control for Talku.ai infrastructure.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Active Tenants" value={stats?.totalActiveTenants ?? 0} icon={Building2} trend="+4" trendType="up" />
          <MetricCard title="Global Volume" value={stats?.totalCalls24h ?? 0} icon={Activity} subtitle="last 24h" />
          <MetricCard title="Net Margin" value={`$${stats?.totalNetMargin?.toFixed(2) ?? '0.00'}`} icon={DollarSign} trend="+12.2%" trendType="up" />
          <MetricCard title="System Health" value={stats?.activeIncidents === 0 ? "Normal" : `${stats?.activeIncidents} Alerts`} icon={ShieldAlert} trendType={stats?.activeIncidents === 0 ? "up" : "down"} />
        </div>
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4 border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle>Global Call Volume</CardTitle>
              <CardDescription>Aggregate traffic across all tenants (7d).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.globalCallVolume ?? []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
          <Card className="md:col-span-3 border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle>Platform Alerts</CardTitle>
              <CardDescription>Recent high-priority incidents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents?.items?.map((inc) => (
                  <div key={inc.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className={cn(
                      "mt-0.5 p-1 rounded-full",
                      inc.severity === 'high' || inc.severity === 'critical' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none">{inc.type}</p>
                        <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">{inc.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{inc.description}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(inc.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
function MetricCard({ title, value, icon: Icon, trend, trendType, subtitle }: { title: string; value: string | number; icon: any; trend?: string; trendType?: 'up' | 'down'; subtitle?: string }) {
  return (
    <Card className="border-muted/40 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <p className={cn("text-xs flex items-center mt-1", trendType === 'up' ? "text-emerald-500" : "text-rose-500")}>
            <TrendingUp className={cn("h-3 w-3 mr-1", trendType === 'down' && "rotate-180")} />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}