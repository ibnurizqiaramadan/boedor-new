import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Star, BarChart3 } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Average Spending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rata-rata Pengeluaran</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(reports.averageSpending)}</div>
          <p className="text-xs text-muted-foreground">
            Total: {formatCurrency(reports.totalSpending)} dari {reports.totalOrders} pesanan
          </p>
        </CardContent>
      </Card>

      {/* Frequently Ordered */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Makanan Favorit</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.frequentlyOrdered.length > 0 ? (
              reports.frequentlyOrdered.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className="text-muted-foreground">{item.totalQty}x</span>
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
          <CardTitle className="text-sm font-medium">Rekomendasi Menu</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.recommendations.length > 0 ? (
              reports.recommendations.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className="text-green-600 font-medium">{formatCurrency(item.price)}</span>
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