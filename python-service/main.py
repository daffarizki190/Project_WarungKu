from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uvicorn
import os

from database import engine, Base, get_db
from analytics import calculate_stock_depletion
from reports import generate_monthly_report

# Init DB schema jika belum ada (tidak perlu jika sudah dibuat Node)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WarungKu Analytics Service", version="1.0.0")

# Setup CORS agar React bisa akses langsung ke microservice ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Python Microservice for WarungKu Analytics is running."}

@app.get("/api/py/predict-stock")
def get_stock_prediction(days: int = 30, db: Session = Depends(get_db)):
    """
    Menghitung prediksi habisnya produk berdasarkan penjualan `days` terakhir.
    """
    predictions = calculate_stock_depletion(db, days_history=days)
    return {
        "success": True,
        "data": predictions
    }

@app.get("/api/py/report/pdf")
def download_monthly_report(
    year: int = Query(..., description="Tahun laporan"),
    month: int = Query(..., description="Bulan laporan (1-12)"),
    db: Session = Depends(get_db)
):
    """
    Menghasilkan laporan laba rugi bulanan dalam format PDF dan mengirimkan file tersebut.
    """
    pdf_path = generate_monthly_report(db, year, month)
    
    filename = f"Laporan_WarungKu_{year}_{month:02d}.pdf"
    
    # Return file as a downloadable response
    return FileResponse(
        path=pdf_path, 
        filename=filename, 
        media_type="application/pdf",
        background=None # Idealnya, pakai background task untuk delete file setelah sent
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
