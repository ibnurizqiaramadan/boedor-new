import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Star, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ReportData {
  averageSpending: number;
  totalSpending: number;
  totalOrders: number;
  frequentlyOrdered: Array<{ name: string; price: number; count: number; totalQty: number }>;
  recommendations: Array<{ name: string; price: number; _id: string }>;
}

interface UserReportsSectionProps {
  reports: ReportData;
}

export function UserReportsSection({ reports }: UserReportsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      {/* Average Spending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Pengeluaran</CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/15 text-blue-400">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">{formatCurrency(reports.averageSpending)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total {formatCurrency(reports.totalSpending)} dari {reports.totalOrders} pesanan
          </p>
        </CardContent>
      </Card>

      {/* Frequently Ordered */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Makanan Favorit</CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/15 text-orange-400">
            <Star className="h-4 w-4" aria-hidden />
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {reports.frequentlyOrdered.length > 0 ? (
              reports.frequentlyOrdered.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-[11px] font-semibold text-orange-400">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground">{item.totalQty}x</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rekomendasi Menu</CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-400/15 text-green-400">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {reports.recommendations.length > 0 ? (
              reports.recommendations.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 font-medium tabular-nums text-green-400">{formatCurrency(item.price)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada rekomendasi</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
