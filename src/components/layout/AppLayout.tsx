import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarAdmin } from "@/components/sidebar-admin";
import { SidebarCustomer } from "@/components/sidebar-customer";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <SidebarProvider defaultOpen={true}>
      {isAdmin ? <SidebarAdmin /> : <SidebarCustomer />}
      <SidebarInset className={className}>
        <div className="absolute left-2 top-2 z-20 flex items-center gap-4 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-md border border-border/20 shadow-sm">
          <SidebarTrigger />
        </div>
        {container ? (
          <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>{children}</div>
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}