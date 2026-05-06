import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Key, Globe, Shield, Terminal, Settings } from 'lucide-react';
export default function SettingsPage() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [devMode, setDevMode] = useState(false);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Global platform configuration and infrastructure controls." : "Workspace profile and developer API access."}
            </p>
          </div>
          {isAdmin && <Badge className="bg-orange-600">Administrative Mode</Badge>}
        </div>
        <div className="grid gap-8">
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <CardTitle>{isAdmin ? "Platform Identity" : "Workspace Profile"}</CardTitle>
              <CardDescription>General settings for your {isAdmin ? "infrastructure" : "team workspace"}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-sm">
                <Label htmlFor="name">{isAdmin ? "Platform Name" : "Organization Name"}</Label>
                <Input id="name" defaultValue={isAdmin ? "Talku.ai Global" : "Acme Corp AI"} />
              </div>
              <div className="grid gap-2 max-w-sm">
                <Label htmlFor="email">Admin Contact</Label>
                <Input id="email" defaultValue="admin@talku.ai" type="email" />
              </div>
              <Button className="mt-2">Update Configuration</Button>
            </CardContent>
          </Card>
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-500" />
                <CardTitle>{isAdmin ? "Provider Credentials" : "API Access"}</CardTitle>
              </div>
              <CardDescription>
                {isAdmin ? "Manage backbone provider keys (OpenAI, ElevenLabs)." : "Integrate Talku.ai into your custom applications."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border">
                  <div>
                    <p className="text-sm font-semibold">{isAdmin ? "OpenAI Master Secret" : "Production Key"}</p>
                    <p className="text-xs text-muted-foreground font-mono">tk_{isAdmin ? "global" : "live"}_••••••••••••••••</p>
                  </div>
                  <Button variant="ghost" size="sm">Reveal</Button>
                </div>
              </div>
              <Button variant="outline" className="w-full">Generate New {isAdmin ? "Master" : ""} Key</Button>
            </CardContent>
          </Card>
          {!isAdmin && (
            <Card className="border-muted/40 shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-blue-500" />
                  <CardTitle>Developer Options</CardTitle>
                </div>
                <CardDescription>Advanced tools for platform developers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Developer Mode</Label>
                    <p className="text-xs text-muted-foreground">Reveal technical session metadata and low-level logs.</p>
                  </div>
                  <Switch checked={devMode} onCheckedChange={setDevMode} />
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-muted/40 shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                <CardTitle>Webhooks</CardTitle>
              </div>
              <CardDescription>Configure endpoints for real-time call event delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Target URL</Label>
                <div className="flex gap-2">
                  <Input id="webhookUrl" placeholder="https://api.yourdomain.com/webhooks" />
                  <Button variant="outline">Test Connection</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}