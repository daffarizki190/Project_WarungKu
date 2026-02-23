import os
from datetime import datetime
from fpdf import FPDF
from sqlalchemy.orm import Session
from database import Transaction, TransactionItem
import tempfile

class ReportPDF(FPDF):
    def header(self):
        # Logo placeholder or Title
        self.set_font('helvetica', 'B', 16)
        self.set_text_color(2, 44, 34) # Emerald 950
        self.cell(0, 10, 'WARUNGKU - Laporan Penjualan', border=False, align='C', new_x="LMARGIN", new_y="NEXT")
        
        self.set_font('helvetica', 'I', 10)
        self.set_text_color(100, 116, 139) # Slate 500
        self.cell(0, 6, f'Dicetak pada: {datetime.now().strftime("%d %b %Y, %H:%M")}', border=False, align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(148, 163, 184) # Slate 400
        # Page number
        self.cell(0, 10, f'Halaman {self.page_no()}/{{nb}}', align='C')

def generate_monthly_report(db: Session, year: int, month: int):
    """
    Generate PDF bulanan yang berisi ringkasan transaksi 
    dan mengembalikan path file PDF sementara.
    """
    # 1. Query database untuk bulan yang diminta
    start_date = datetime(year, month, 1)
    
    # Kalkulasi akhir bulan
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    transactions = db.query(Transaction).filter(
        Transaction.createdAt >= start_date,
        Transaction.createdAt < end_date
    ).all()

    # 2. Setup PDF
    pdf = ReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Title periode
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(5, 150, 105) # Emerald 600
    month_names = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    pdf.cell(0, 10, f'Periode: {month_names[month-1]} {year}', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # 3. Hitung Agregasi
    total_revenue = sum(t.total for t in transactions)
    total_discount = sum(t.discount for t in transactions)
    total_trx = len(transactions)

    # Kotak Ringkasan
    pdf.set_fill_color(248, 250, 252) # Slate 50
    pdf.set_draw_color(226, 232, 240) # Slate 200
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(71, 85, 105) # Slate 600
    
    pdf.rect(10, pdf.get_y(), 190, 25, style="DF")
    pdf.set_xy(15, pdf.get_y() + 5)
    pdf.cell(60, 6, "Total Transaksi:")
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, f"{total_trx} trx", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_x(15)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(60, 6, "Total Diskon Diberikan:")
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, f"Rp {total_discount:,}".replace(',', '.'), new_x="LMARGIN", new_y="NEXT")

    pdf.set_x(15)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(60, 6, "Total Pendapatan Kotor:")
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(5, 150, 105) # Emerald 600
    pdf.cell(0, 6, f"Rp {total_revenue:,}".replace(',', '.'), new_x="LMARGIN", new_y="NEXT")

    pdf.ln(15) # Jarak ke tabel
    
    # 4. Tabel Rincian Transaksi
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(2, 44, 34)
    pdf.cell(0, 10, "Rincian Transaksi Terbaru:", new_x="LMARGIN", new_y="NEXT")
    
    # Header Tabel
    pdf.set_fill_color(5, 150, 105) # Emerald 600
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 9)
    
    # Kolom layout (Widths)
    w_waktu = 35
    w_id = 45
    w_metode = 35
    w_item = 25
    w_total = 50
    
    pdf.cell(w_waktu, 8, "Waktu", border=1, fill=True, align="C")
    pdf.cell(w_id, 8, "ID Transaksi", border=1, fill=True, align="C")
    pdf.cell(w_metode, 8, "Pembayaran", border=1, fill=True, align="C")
    pdf.cell(w_item, 8, "Barang", border=1, fill=True, align="C")
    pdf.cell(w_total, 8, "Total", border=1, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")

    # Body Tabel
    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(71, 85, 105)
    
    # Ambil 50 transaksi terbaru untuk rincian (agar pdf tidak terlalu raksasa)
    for t in sorted(transactions, key=lambda x: x.createdAt, reverse=True)[:50]:
        # Count items
        item_count = db.query(TransactionItem).filter(TransactionItem.transactionId == t.id).count()
        payment = t.paymentMethod if t.paymentMethod else 'CASH'
        
        # Color zebra striping
        pdf.cell(w_waktu, 7, t.createdAt.strftime("%d-%m-%Y %H:%M"), border=1, align="C")
        pdf.cell(w_id, 7, t.id[:10] + "...", border=1, align="C")
        pdf.cell(w_metode, 7, payment, border=1, align="C")
        pdf.cell(w_item, 7, f"{item_count} jenis", border=1, align="C")
        pdf.cell(w_total, 7, f"Rp {t.total:,}".replace(',', '.'), border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    if len(transactions) > 50:
        pdf.set_font("helvetica", "I", 8)
        pdf.cell(0, 10, f"* Menampilkan 50 dari {total_trx} transaksi di bulan ini.", align="C")

    # 5. Simpan ke Temporary File
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(temp_file.name)
    
    return temp_file.name
