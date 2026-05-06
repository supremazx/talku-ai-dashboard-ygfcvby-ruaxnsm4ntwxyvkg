import React, { useMemo } from "react";
import {
  LayoutDashboard,
  Bot,
  Hash,
  History,
  CreditCard,
  Settings,
  Mic,
  ChevronDown,
  Building2,
  Zap,
  Activity
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useTenantStore } from "@/lib/tenant-store";
import { api } from "@/lib/api-client";
import type { Tenant, GlobalCall } from "@shared/types";
export function SidebarCustomer(): JSX.Element {
  const location = useLocation();
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const setTenant = useTenantStore((s) => s.setTenant);
  const { data: tenantsData } = useQuery({
    queryKey: ['available-tenants'],
    queryFn: () => api<{ items: Tenant[] }>('/api/admin/tenants'),
    staleTime: 1000 * 60 * 5,
  });
  const { data: liveData } = useQuery({
    queryKey: ['app-calls-live', activeTenantId],
    queryFn: () => api<{ items: GlobalCall[] }>('/api/app/calls/live', {
      headers: { 'X-Tenant-Id': activeTenantId }
    }),
    refetchInterval: 5000,
  });
  const tenants = useMemo(() => tenantsData?.items ?? [], [tenantsData]);
  const liveCount = useMemo(() => liveData?.items?.length ?? 0, [liveData]);
  const currentTenant = useMemo(() => {
    return tenants.find(t => t.id === activeTenantId) ?? {
      name: "Select Workspace",
      credits: 0,
      plan: "free" as const
    };
  }, [tenants, activeTenantId]);
  const items = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/app" },
    { title: "Live Activity", icon: Activity, url: "/app/live", badge: liveCount > 0 ? liveCount : null },
    { title: "AI Agents", icon: Bot, url: "/app/agents" },
    { title: "Numbers & Routing", icon: Hash, url: "/app/numbers" },
    { title: "Call Logs", icon: History, url: "/app/logs" },
    { title: "Billing", icon: CreditCard, url: "/app/billing" },
    { title: "Settings", icon: Settings, url: "/app/settings" },
  ];
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader>
        <div className="flex flex-col gap-1 px-2 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-orange-500/20 shadow-lg">
              <Mic className="h-5 w-5" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                Talku<span className="text-orange-600">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Voice Platform</span>
            </div>
          </div>
          <div className="mt-4 px-2 group-data-[collapsible=icon]:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-muted/50 rounded-md border border-border/50 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    <span className="truncate">{currentTenant.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setTenant(t)}
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      activeTenantId === t.id && "bg-accent font-bold"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{t.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                        {t.plan} Plan
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                  className={cn(
                    "transition-all duration-200 hover:bg-accent group",
                    location.pathname === item.url && "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-semibold"
                  )}
                >
                  <Link to={item.url} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <item.icon className={cn("h-4 w-4", location.pathname === item.url && "text-orange-600")} />
                      <span>{item.title}</span>
                      {item.title === "Live Activity" && liveCount > 0 && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="ml-auto bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Credits</p>
              <Link to="/app/billing" className="text-[10px] text-orange-600 font-bold hover:underline">Refill</Link>
            </div>
            <p className="text-sm font-bold">
              ${typeof currentTenant.credits === 'number' ? currentTenant.credits.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}