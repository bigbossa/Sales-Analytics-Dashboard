import express from 'express';
import pg from 'pg';

const app = express();
app.use(express.json({ limit: '50mb' }));

const pool = new pg.Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '25800852',
  database: 'shopee',
});

// Thai header -> DB column mapping
const COLUMN_MAP: Record<string, string> = {
  'รหัสสินค้า': 'product_id',
  'ผลิตภัณฑ์': 'product_name',
  'สถานะสินค้าปัจจุบัน': 'current_product_status',
  'รหัสตัวเลือกสินค้า': 'variation_id',
  'ชื่อตัวเลือกสินค้า': 'variation_name',
  'สถานะตัวเลือกสินค้าปัจจุบัน': 'current_variation_status',
  'SKU': 'sku',
  'Parent SKU': 'parent_sku',
  'ยอดขาย (ที่มีคำสั่งซื้อทั้งหมด) (THB)': 'sales_all_orders_thb',
  'ยอดขาย (ยืนยันแล้ว) (THB)': 'sales_confirmed_thb',
  'การเข้าชมสินค้า': 'product_visits',
  'จำนวนคลิก': 'clicks',
  'อัตราการคลิก': 'click_rate',
  'อัตราการซื้อสินค้า (ทั้งหมด)': 'conversion_rate_all',
  'อัตราการซื้อสินค้า (ยืนยันแล้ว)': 'conversion_rate_confirmed',
  'ทั้งหมด': 'orders_total',
  'ยืนยันแล้ว': 'orders_confirmed',
  'จำนวนที่ขายได้ (ที่มีคำสั่งซื้อทั้งหมด)': 'units_sold_all_orders',
  'จำนวนที่ขายได้ (ยืนยันแล้ว)': 'units_sold_confirmed',
  'ผู้ซื้อ (ที่มีคำสั่งซื้อทั้งหมด)': 'buyers_all_orders',
  'ผู้ซื้อ (ยืนยันคำสั่งซื้อแล้ว)': 'buyers_confirmed',
  'อัตราคำสั่งซื้อ (ที่มีคำสั่งซื้อทั้งหมด)': 'order_rate_all',
  'อัตราคำสั่งซื้อ (ยืนยันคำสั่งซื้อแล้ว)': 'order_rate_confirmed',
  'ยอดขายต่อคำสั่งซื้อ (ทั้งหมด) (THB)': 'sales_per_order_all_thb',
  'ยอดขายต่อคำสั่งซื้อ (ยืนยันแล้ว) (THB)': 'sales_per_order_confirmed_thb',
  'ยอดการมองเห็นสินค้าที่ไม่ซ้ำ': 'unique_impressions',
  'ยอดกดเข้าชมสินค้าที่ไม่ซ้ำ': 'unique_product_clicks',
  'ยอดเข้าชมสินค้า': 'product_page_views',
  'ผู้เข้าชมสินค้า': 'unique_visitors',
  'ค่าเฉลี่ยระยะเวลาดูสินค้า': 'avg_viewing_duration',
  'จำนวนการแนะนำสินค้า': 'product_recommendations',
  'จำนวนการกดเข้าสินค้า': 'clicks_from_recommendations',
  'จำนวนคลิกจากผลการค้นหา': 'clicks_from_search',
  'จำนวนการกดถูกใจ': 'likes_count',
  'ผู้เข้าชมสินค้า (เพิ่มสินค้าเข้าไปในรถเข็น)': 'visitors_add_to_cart',
  'จำนวนที่ขายได้ (เพิ่มสินค้าในรถเข็น)': 'units_sold_add_to_cart',
  'อัตราการซื้อสินค้า (เพิ่มสินค้าในรถเข็น)': 'conversion_rate_add_to_cart',
  'อัตราการซื้อซ้ำ (ทั้งหมด)': 'repurchase_rate_all',
  'อัตราการซื้อซ้ำ (ยืนยันแล้ว)': 'repurchase_rate_confirmed',
  'เวลาเฉลี่ยก่อนซื้อซ้ำ (ทั้งหมด)': 'avg_time_before_repurchase_all',
  'เวลาเฉลี่ยก่อนซื้อซ้ำ (ยืนยันแล้ว)': 'avg_time_before_repurchase_confirmed',
  'Date': 'date',
};

// Numeric columns (need parseFloat)
const NUMERIC_COLS = new Set([
  'sales_all_orders_thb', 'sales_confirmed_thb', 'click_rate',
  'conversion_rate_all', 'conversion_rate_confirmed', 'order_rate_all',
  'order_rate_confirmed', 'sales_per_order_all_thb', 'sales_per_order_confirmed_thb',
  'avg_viewing_duration', 'conversion_rate_add_to_cart',
  'repurchase_rate_all', 'repurchase_rate_confirmed',
  'avg_time_before_repurchase_all', 'avg_time_before_repurchase_confirmed',
]);

const INTEGER_COLS = new Set([
  'product_visits', 'clicks', 'orders_total', 'orders_confirmed',
  'units_sold_all_orders', 'units_sold_confirmed', 'buyers_all_orders',
  'buyers_confirmed', 'unique_impressions', 'unique_product_clicks',
  'product_page_views', 'unique_visitors', 'product_recommendations',
  'clicks_from_recommendations', 'clicks_from_search', 'likes_count',
  'visitors_add_to_cart', 'units_sold_add_to_cart',
]);

function parseValue(dbCol: string, val: any): any {
  if (val === null || val === undefined || val === '' || val === '-') return null;
  if (dbCol === 'date') {
    // Handle Excel serial date or string date
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return val;
  }
  if (NUMERIC_COLS.has(dbCol)) {
    const str = String(val).replace(/,/g, '').replace(/%/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }
  if (INTEGER_COLS.has(dbCol)) {
    const str = String(val).replace(/,/g, '');
    const num = parseInt(str, 10);
    return isNaN(num) ? null : num;
  }
  return String(val);
}

app.post('/api/upload-to-db', async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'No data provided' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let inserted = 0;
    for (const row of rows) {
      const dbRow: Record<string, any> = {};

      // Map Thai headers to DB columns
      for (const [thaiKey, value] of Object.entries(row)) {
        const trimmedKey = thaiKey.trim();
        const dbCol = COLUMN_MAP[trimmedKey];
        if (dbCol) {
          dbRow[dbCol] = parseValue(dbCol, value);
        }
      }

      // Skip rows with no mapped columns
      const cols = Object.keys(dbRow);
      if (cols.length === 0) continue;

      const values = cols.map(c => dbRow[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`);
      const query = `INSERT INTO product_performance (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`;
      await client.query(query, values);
      inserted++;
    }

    await client.query('COMMIT');
    res.json({ success: true, inserted });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('DB upload error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
