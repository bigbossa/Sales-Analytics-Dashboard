import React, { useMemo } from 'react';
import { SummaryCard } from './SummaryCard';
import { SalesChart } from './SalesChart';
import { DataTable } from './DataTable';
import { 
  DollarSign, 
  ShoppingBag, 
  Eye, 
  MousePointerClick, 
  TrendingUp,
  Package
} from 'lucide-react';

interface DashboardProps {
  data: any[];
}

export function Dashboard({ data }: DashboardProps) {
  // Process data to extract metrics
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Helper to safely parse numbers from strings like "1,234.56" or just numbers
    const parseNum = (val: any) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        return parseFloat(val.replace(/,/g, '')) || 0;
      }
      return 0;
    };

    // Identify columns based on common Thai headers or English equivalents
    const findKey = (keywords: string[]) => {
      const firstRow = data[0];
      return Object.keys(firstRow).find(key => 
        keywords.some(k => key.includes(k))
      );
    };

    // Updated keywords based on user screenshot
    const salesKey = findKey(['ยอดขาย (ยืนยันแล้ว)', 'Sales', 'Revenue', 'ยอดขาย']);
    const ordersKey = findKey(['การสั่งซื้อ (ยืนยันแล้ว)', 'คำสั่งซื้อ', 'Orders']);
    const viewsKey = findKey(['ยอดเข้าชมสินค้า', 'Views', 'เข้าชม']);
    const productKey = findKey(['ผลิตภัณฑ์', 'Product Name', 'Name', 'สินค้า']);
    const unitsSoldKey = findKey(['จำนวนที่ขายได้', 'Units Sold', 'จำนวน']);

    let totalSales = 0;
    let totalOrders = 0;
    let totalViews = 0;
    let totalUnits = 0;

    // Top products calculation
    const productPerformance: Record<string, { sales: number, orders: number }> = {};

    data.forEach(row => {
      if (salesKey) totalSales += parseNum(row[salesKey]);
      if (ordersKey) totalOrders += parseNum(row[ordersKey]);
      if (viewsKey) totalViews += parseNum(row[viewsKey]);
      if (unitsSoldKey) totalUnits += parseNum(row[unitsSoldKey]);

      if (productKey && salesKey) {
        const productName = row[productKey];
        const sales = parseNum(row[salesKey]);
        const orders = ordersKey ? parseNum(row[ordersKey]) : 0;
        
        if (productName) {
            // Truncate long names
            const shortName = productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
            if (!productPerformance[shortName]) {
                productPerformance[shortName] = { sales: 0, orders: 0 };
            }
            productPerformance[shortName].sales += sales;
            productPerformance[shortName].orders += orders;
        }
      }
    });

    // Convert product performance to array for chart
    const topProducts = Object.entries(productPerformance)
      .map(([name, stats]) => ({ name, sales: stats.sales, orders: stats.orders }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10); // Top 10

    return {
      totalSales,
      totalOrders,
      totalViews,
      totalUnits,
      topProducts,
      salesKey,
      ordersKey
    };
  }, [data]);

  if (!metrics) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Sales (Confirmed)"
          value={`฿${metrics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
        />
        <SummaryCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          icon={ShoppingBag}
          color="indigo"
        />
        <SummaryCard
          title="Total Views"
          value={metrics.totalViews.toLocaleString()}
          icon={Eye}
          color="amber"
        />
        <SummaryCard
          title="Units Sold"
          value={metrics.totalUnits.toLocaleString()}
          icon={Package}
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SalesChart
          title="Top 10 Products by Sales"
          data={metrics.topProducts}
          dataKey="sales"
          xAxisKey="name"
          type="bar"
          color="#10b981"
        />
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products Performance</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3 text-right">Sales (THB)</th>
                            <th className="px-6 py-3 text-right">Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.topProducts.slice(0, 8).map((product, idx) => (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    ฿{product.sales.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {product.orders.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      </div>

      {/* Full Data Table */}
      <DataTable data={data} />
    </div>
  );
}
