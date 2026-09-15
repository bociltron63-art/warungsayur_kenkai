from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import product_service

# MongoDB connection (used only for the order-number counter, not for products)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Warung Sayur KenKai API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ---------------- Models ----------------
class Product(BaseModel):
    id: str
    sku: str
    nama_produk: str
    kategori: str
    deskripsi: str
    harga: int
    satuan: str
    stok: int
    foto: str
    aktif: bool


class Config(BaseModel):
    brand: str
    owner_whatsapp_number: str
    service_areas: List[str]


class OrderNumber(BaseModel):
    order_number: str


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Warung Sayur KenKai API"}


@api_router.get("/config", response_model=Config)
async def get_config():
    return Config(
        brand="Warung Sayur KenKai",
        owner_whatsapp_number=os.environ.get("OWNER_WHATSAPP_NUMBER", "62XXXXXXXXXXX"),
        service_areas=["Bekasi", "Tipar Cakung"],
    )


@api_router.get("/products", response_model=List[Product])
async def list_products(refresh: bool = False):
    try:
        return product_service.get_products(force=refresh)
    except product_service.ProductSourceError as exc:
        logger.error("Product source error: %s", exc)
        raise HTTPException(status_code=503, detail="Katalog sedang diperbarui.")


@api_router.get("/categories", response_model=List[str])
async def list_categories():
    try:
        return product_service.get_categories()
    except product_service.ProductSourceError as exc:
        logger.error("Category source error: %s", exc)
        raise HTTPException(status_code=503, detail="Katalog sedang diperbarui.")


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    try:
        product = product_service.get_product(product_id)
    except product_service.ProductSourceError as exc:
        logger.error("Product source error: %s", exc)
        raise HTTPException(status_code=503, detail="Katalog sedang diperbarui.")
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")
    return product


@api_router.post("/order-number", response_model=OrderNumber)
async def create_order_number():
    """Generate a unique order number KKN-YYYYMMDD-XXX using a daily counter."""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    doc = await db.order_counters.find_one_and_update(
        {"_id": today},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = doc["seq"] if doc else 1
    return OrderNumber(order_number=f"KKN-{today}-{seq:03d}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
