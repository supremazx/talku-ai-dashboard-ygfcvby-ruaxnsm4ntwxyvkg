import React, { useMemo } from "react";
import {
  LayoutDashboard,
  Building2,
  ListChecks,
  BarChart3,
  WalletCards,
  Activity,
  Fingerprint,
  Settings,
  Mic,
  BadgeAlert,
  Radio,
  Zap
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
import { api } from "@/lib/api-client";
import type { GlobalCall } from "@shared/types";
export function SidebarAdmin(): JSX.Element {
  const location = useLocation();
  const { data: liveData } = useQuery({
    queryKey: ['admin-calls-live'],
    queryFn: () => api<{ items: GlobalCall[] }>('/api/admin/calls/live'),
    refetchInterval: 5000,
  });
  const liveCount = useMemo(() => liveData?.items?.length ?? 0, [liveData]);
  const items = [
    { title: "Overview", icon: LayoutDashboard, url: "/admin" },
    { title: "Live Monitor", icon: Radio, url: "/admin/live", badge: liveCount > 0 ? liveCount : null },
    { title: "Tenants", icon: Building2, url: "/admin/tenants" },
    { title: "Global Calls", icon: ListChecks, url: "/admin/logs" },
    { title: "Integrations", icon: Zap, url: "/admin/integrations" },
    { title: "Usage & Costs", icon: BarChart3, url: "/admin/usage" },
    { title: "Billing Ops", icon: WalletCards, url: "/admin/billing" },
    { title: "System Health", icon: Activity, url: "/admin/health" },
    { title: "Audit Logs", icon: Fingerprint, url: "/admin/audit" },
    { title: "Settings", icon: Settings, url: "/admin/settings" },
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
                Talku<span className="text-orange-600">Admin</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Control Panel</span>
            </div>
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
                  tooltip={item.title}
                  isActive={location.pathname === item.url}
                  className={cn(
                    "transition-all duration-200 hover:bg-accent group",
                    location.pathname === item.url && "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-semibold"
                  )}
                >
                  <Link to={item.url} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <item.icon className={cn("h-4 w-4", location.pathname === item.url && "text-orange-600")} />
                      <span>{item.title}</span>
                      {item.title === "Live Monitor" && liveCount > 0 && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="ml-auto bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
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
          <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
            <div className="flex items-center gap-2">
              <BadgeAlert className="h-3 w-3 text-red-600" />
              <p className="text-xs font-bold text-red-600 uppercase">System Alert</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">2 Active Provider Incidents</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}