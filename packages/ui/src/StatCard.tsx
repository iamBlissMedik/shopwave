import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

/** Single headline metric tile used on both dashboards. */
export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="p-4 transition-shadow duration-300 hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        <span className="rounded-md bg-brand/10 p-2 text-brand">
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
}
