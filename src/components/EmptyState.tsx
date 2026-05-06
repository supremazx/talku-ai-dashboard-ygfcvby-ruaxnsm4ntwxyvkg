import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/20 mb-6">
        <Icon className="h-10 w-10 text-orange-600" />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-8 btn-gradient px-8">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}