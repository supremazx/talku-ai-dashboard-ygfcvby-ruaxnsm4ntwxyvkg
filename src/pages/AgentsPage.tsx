import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Bot, Mic, Trash2, Edit2, Radio, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Agent, GlobalCall } from '@shared/types';
import { Badge } from '@/components/ui/badge';
import { useTenantStore } from '@/lib/tenant-store';
import { toast } from 'sonner';
import { EmptyState } from '@/components/EmptyState';
export default function AgentsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const { data: agents, isLoading } = useQuery({
    queryKey: ['app-agents', activeTenantId],
    queryFn: () => api<{ items: Agent[] }>('/api/app/agents', {
      headers: { 'X-Tenant-Id': activeTenantId }
    })
  });
  const { data: liveData } = useQuery({
    queryKey: ['app-calls-live', activeTenantId],
    queryFn: () => api<{ items: GlobalCall[] }>('/api/app/calls/live', {
      headers: { 'X-Tenant-Id': activeTenantId }
    }),
    refetchInterval: 5000,
  });
  const createAgent = useMutation({
    mutationFn: (newAgent: Partial<Agent>) => api<Agent>('/api/app/agents', {
      method: 'POST',
      headers: { 'X-Tenant-Id': activeTenantId },
      body: JSON.stringify(newAgent)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-agents'] });
      setOpen(false);
      toast.success('AI Persona deployed successfully');
    }
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAgent.mutate({
      name: formData.get('name') as string,
      prompt: formData.get('prompt') as string,
      voice: formData.get('voice') as string,
      language: 'en-US',
      provider: 'openai',
      temperature: 0.7
    });
  };
  const isAgentLive = (agentId: string) => {
    return liveData?.items?.some(call => call.agentId === agentId) ?? false;
  };
  const agentList = agents?.items ?? [];
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
            <p className="text-muted-foreground">Configure the personalities and behavioral logic of your voice AI.</p>
          </div>
          {agentList.length > 0 && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gradient">
                  <Plus className="mr-2 h-4 w-4" /> Create Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>New Voice Persona</DialogTitle>
                  <DialogDescription>Define behavior and voice profile.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Concierge" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice Profile</Label>
                    <Select name="voice" defaultValue="bella">
                      <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bella">Bella (Soft)</SelectItem>
                        <SelectItem value="echo">Echo (Neutral)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Behavior Instructions</Label>
                    <Textarea id="prompt" name="prompt" className="h-40 font-mono text-xs" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={createAgent.isPending}>
                    Deploy Agent
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-muted/20 border-muted/40" />)}
          </div>
        ) : agentList.length === 0 ? (
          <EmptyState 
            icon={Bot} 
            title="No Agents Found" 
            description="You haven't created any AI personalities yet. Agents define how your platform speaks and interacts with callers."
            actionLabel="Deploy Your First Agent"
            onAction={() => setOpen(true)}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agentList.map((agent) => (
              <Card key={agent.id} className="group relative overflow-hidden border-muted/40 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/20 text-orange-600 shadow-sm border border-orange-500/10">
                      <Bot className="h-6 w-6" />
                    </div>
                    {isAgentLive(agent.id) && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 animate-pulse h-6">
                        <Radio className="h-3 w-3" /> LIVE
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 flex items-center gap-2">
                    {agent.name}
                    {agent.temperature > 0.8 && <Sparkles className="h-3 w-3 text-orange-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-3 italic min-h-[3rem]">"{agent.prompt}"</p>
                </CardContent>
                <CardFooter className="bg-muted/10 flex justify-between pt-4 border-t">
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    <Mic className="h-3 w-3" /> {agent.voice}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}