import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
const COLORS = ['#3b82f6', '#f97316', '#10b981', '#6366f1'];
export default function UsagePage() {
  const { data: usageStats } = useQuery({
    queryKey: ['usage-stats-detailed'],
    queryFn: () => api<{ providers: any[] }>('/api/admin/usage-stats')
  });
  const pieData = usageStats?.providers.map(p => ({
    name: p.provider.toUpperCase(),
    value: p.volume
  })) ?? [];
  const barData = [
    { name: 'Mon', revenue: 4000, cost: 2400 },
    { name: 'Tue', revenue: 3000, cost: 1398 },
    { name: 'Wed', revenue: 2000, cost: 9800 },
    { name: 'Thu', revenue: 2780, cost: 3908 },
    { name: 'Fri', revenue: 1890, cost: 4800 },
    { name: 'Sat', revenue: 2390, cost: 3800 },
    { name: 'Sun', revenue: 3490, cost: 4300 },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage & Costs</h1>
          <p className="text-muted-foreground">Detailed financial and operational performance metrics.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <UsageMetricCard title="Gross Revenue" value="$42,402.50" trend="+12.5%" />
          <UsageMetricCard title="Provider Spend" value="$18,120.20" trend="+4.2%" trendType="down" />
          <UsageMetricCard title="Net Margin" value="$24,282.30" trend="+18.4%" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Revenue vs Cost
              </CardTitle>
              <CardDescription>Daily financial snapshot across all infrastructure.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-orange-500" />
                Provider Distribution
              </CardTitle>
              <CardDescription>Volume split by AI voice technology providers.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-muted-foreground uppercase font-bold">Total Volume</span>
                <span className="text-xl font-bold">245k</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="border-muted/40 shadow-soft">
          <CardHeader>
            <CardTitle>Top Performance Tenants</CardTitle>
            <CardDescription>Organizations with the highest contribution margin (30d).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Usage Volume</TableHead>
                  <TableHead>Avg. Latency</TableHead>
                  <TableHead className="text-right">Net Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Acme Corp', plan: 'enterprise', volume: '124k', latency: '420ms', margin: '$4,200.00' },
                  { name: 'Globex Ind', plan: 'pro', volume: '82k', latency: '380ms', margin: '$3,150.00' },
                  { name: 'Pied Piper', plan: 'pro', volume: '45k', latency: '405ms', margin: '$1,820.00' },
                  { name: 'Hooli AI', plan: 'enterprise', volume: '12k', latency: '950ms', margin: '$1,100.00' },
                ].map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold">{t.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{t.plan}</Badge></TableCell>
                    <TableCell className="text-xs">{t.volume}</TableCell>
                    <TableCell className="text-xs">{t.latency}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600">+{t.margin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
function UsageMetricCard({ title, value, trend, trendType = 'up' }: { title: string, value: string, trend: string, trendType?: 'up' | 'down' }) {
  return (
    <Card className="border-muted/40 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={cn(
          "flex items-center text-xs mt-1",
          trendType === 'up' ? "text-emerald-500" : "text-rose-500"
        )}>
          {trendType === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {trend} vs last month
        </div>
      </CardContent>
    </Card>
  );
}