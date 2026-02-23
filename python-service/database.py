from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

# Menunjuk ke database SQLite milik Node.js backend
SQLALCHEMY_DATABASE_URL = "sqlite:///../server/warungku.sqlite"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Mapping Model dari Node.js => SQLAlchemy
class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    name = Column(String, index=True)
    category = Column(String)
    price = Column(Integer)
    stock = Column(Integer)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    total = Column(Integer)
    discount = Column(Integer, default=0)
    customerName = Column(String)
    change = Column(Integer)
    amountPaid = Column(Integer)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)
    # paymentMethod dan status disimpan di kolom JSON string
    status = Column(String) 
    paymentMethod = Column(String)

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(String, primary_key=True)
    transactionId = Column(String, ForeignKey("transactions.id"))
    productId = Column(String, ForeignKey("products.id"))
    name = Column(String)
    price = Column(Integer)
    qty = Column(Integer)
    subtotal = Column(Integer)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
