import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Webhook, Zap, ShieldCheck, RefreshCw, Key, Globe, Activity, Terminal } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
export default function IntegrationsPage() {
  const { data: status, isLoading } = useQuery({
    queryKey: ['integrations-status'],
    queryFn: () => api<any>('/api/admin/integrations/status')
  });
  const providers = [
    { id: 'mediasfu', name: 'MediaSFU', icon: Globe, description: 'Core WebRTC & Telephony SFU cluster.', status: status?.mediasfu ?? 'online' },
    { id: 'openai', name: 'OpenAI', icon: Zap, description: 'LLM & Voice Pipeline for Agent intelligence.', status: status?.openai ?? 'online' },
    { id: 'elevenlabs', name: 'ElevenLabs', icon: Activity, description: 'High-fidelity TTS provider.', status: status?.elevenlabs ?? 'online' },
    { id: 'deepgram', name: 'Deepgram', icon: Terminal, description: 'Ultra-low latency STT pipeline.', status: status?.deepgram ?? 'online' },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Integrations Hub</h1>
          <p className="text-muted-foreground">Manage backbone providers and platform API authentication.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {providers.map((p) => (
            <Card key={p.id} className="border-muted/40 shadow-soft">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <p.icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <Badge variant={p.status === 'online' ? 'secondary' : 'destructive'} className="text-[10px] uppercase">
                    {p.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{p.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{p.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold gap-2">
                  <ShieldCheck className="h-3 w-3" /> Configure
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-500" />
                API Keys
              </CardTitle>
              <CardDescription>Global platform keys used for secure infrastructure calls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production Secret</p>
                    <p className="text-sm font-mono">tk_live_••••••••••••72f1</p>
                  </div>
                  <Button variant="ghost" size="sm"><RefreshCw className="h-3 w-3" /></Button>
                </div>
              </div>
              <Button className="w-full" variant="outline">Generate Key Pair</Button>
            </CardContent>
          </Card>
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-emerald-500" />
                Global Webhooks
              </CardTitle>
              <CardDescription>Primary endpoint for all platform-wide event delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://your-api.com/webhooks" defaultValue="https://logs.talku.ai/ingest" />
                  <Button variant="outline" onClick={() => toast.success('Test event queued')}>Test</Button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs">Retry on failure</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}