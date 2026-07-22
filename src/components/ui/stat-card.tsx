import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** tailwind classes for the icon chip, e.g. "bg-blue-400/15 text-blue-400" */
  chip: string;
}

export function StatCard({ label, value, icon: Icon, chip }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-4 text-center md:flex-row md:gap-4 md:p-6 md:text-left">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${chip}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <p className="text-xs text-muted-foreground md:text-sm">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
