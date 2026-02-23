import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import Product, Transaction, TransactionItem

def calculate_stock_depletion(db: Session, days_history: int = 30):
    """
    Menghitung prediksi habisnya stok setiap produk berdasarkan 
    rata-rata penjualan selama `days_history` ke belakang.
    """
    # 1. Ambil data produk saat ini
    products = db.query(Product).all()
    if not products:
        return []

    # 2. Ambil transaksi X hari terakhir
    cutoff_date = datetime.now() - timedelta(days=days_history)
    
    # Karena kita akan memroses data dengan pandas, 
    # langsung baca dari tabel lewat raw query / pandas native lebih cepat
    query = f"""
        SELECT ti.productId, ti.qty, t.createdAt 
        FROM transaction_items ti
        JOIN transactions t ON ti.transactionId = t.id
        WHERE t.createdAt >= '{cutoff_date.isoformat()}'
    """
    
    # Load ke Pandas DataFrame
    df = pd.read_sql_query(query, db.bind)
    
    results = []
    
    for p in products:
        # Filter transaksi untuk produk ini
        product_sales = df[df['productId'] == p.id] if not df.empty else pd.DataFrame()
        
        # Hitung total yang terjual dalam X hari terakhir
        total_sold = int(product_sales['qty'].sum()) if not product_sales.empty else 0
        
        # Rata-rata terjual per hari
        avg_daily_sales = total_sold / days_history
        
        # Hitung sisa hari (days until empty)
        days_remaining = None
        if avg_daily_sales > 0:
            days_remaining = int(p.stock / avg_daily_sales)
        elif p.stock == 0:
            days_remaining = 0
            
        status = "Aman"
        if days_remaining is not None:
            if days_remaining <= 3:
                status = "Kritis"
            elif days_remaining <= 7:
                status = "Waspada"
                
        results.append({
            "productId": p.id,
            "name": p.name,
            "currentStock": p.stock,
            "totalSoldLast30Days": total_sold,
            "avgDailySales": round(avg_daily_sales, 2),
            "estimatedDaysRemaining": days_remaining,
            "status": status
        })
        
    # Urutkan berdasarkan yang paling cepat habis
    # yang days_remaining nya None (tidak ada penjualan) taruh di bawah
    def sort_key(x):
        return x['estimatedDaysRemaining'] if x['estimatedDaysRemaining'] is not None else 999999
        
    results.sort(key=sort_key)
    
    return results
