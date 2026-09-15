"""
productService - Single source of truth adapter for Warung Sayur KenKai products.

Reads product master data from a PUBLIC Google Sheet (CSV export) when
GOOGLE_SHEET_CSV_URL is configured. If it is not configured, a bundled mock
catalog is used so the app is fully functional out of the box.

Responsibilities:
- Fetch products (Google Sheet CSV or mock)
- Parse & validate rows
- Filter active products (aktif = TRUE)
- Preserve `satuan` on every product
- Simple in-memory cache with TTL
- Raise a clear error when the sheet is unreachable
"""

import csv
import io
import logging
import os
import time
from typing import List, Dict

import requests

logger = logging.getLogger("product_service")

CACHE_TTL = int(os.environ.get("PRODUCT_CACHE_TTL", "300"))
SHEET_URL = os.environ.get("GOOGLE_SHEET_CSV_URL", "").strip()

_cache: Dict[str, object] = {"data": None, "ts": 0.0}


class ProductSourceError(Exception):
    """Raised when the product master source cannot be read."""


# ---------------------------------------------------------------------------
# Mock catalog (used when GOOGLE_SHEET_CSV_URL is empty).
# Column order mirrors the required Google Sheet structure exactly.
# ---------------------------------------------------------------------------
_IMG = "https://images.unsplash.com/{id}?crop=entropy&cs=srgb&fm=jpg&q=85&w=900&h=900&fit=crop"

MOCK_CSV = """id,sku,nama_produk,kategori,deskripsi,harga,satuan,stok,foto,aktif
001,SAY001,Bayam Segar,Sayuran,Bayam hijau segar pilihan dipetik pagi hari.,5000,ikat,50,{spinach},TRUE
002,SAY002,Kangkung Segar,Sayuran,Kangkung segar renyah cocok untuk tumisan.,4000,ikat,40,{spinach2},TRUE
003,SAY003,Wortel,Sayuran,Wortel manis segar kaya vitamin A.,12000,kg,30,{carrots},TRUE
004,SAY004,Tomat Merah,Sayuran,Tomat merah matang segar untuk masakan & jus.,15000,kg,35,{tomatoes},TRUE
005,BUA001,Apel Fuji,Buah,Apel Fuji manis segar dan renyah.,35000,kg,25,{apple},TRUE
006,BUM001,Bawang Merah,Bumbu Dapur,Bawang merah pilihan kualitas terbaik.,35000,kg,20,{shallots},TRUE
007,BUM002,Cabai Merah Keriting,Bumbu Dapur,Cabai merah keriting segar dan pedas.,45000,kg,15,{chili},TRUE
008,TEL001,Telur Ayam Negeri,Telur,Telur ayam segar dijual per butir.,2500,pcs,200,{eggs},TRUE
009,PRO001,Dada Ayam Fillet,Protein,Dada ayam fillet segar tanpa tulang.,38000,kg,18,{chicken},TRUE
010,PRO002,Tahu Putih,Protein,Tahu putih lembut isi per bungkus.,6000,bungkus,40,{tofu},TRUE
011,SEM001,Beras Pandan Wangi,Sembako,Beras pandan wangi pulen kualitas premium.,68000,kg,25,{rice},TRUE
012,SEM002,Minyak Goreng 1L,Sembako,Minyak goreng kemasan 1 liter.,18000,botol,0,,TRUE
013,KEB001,Gula Pasir,Kebutuhan Dapur,Gula pasir putih bersih per kilogram.,16000,kg,30,,TRUE
014,LAI001,Kecap Manis,Lainnya,Kecap manis kental (contoh produk nonaktif).,22000,botol,12,,FALSE
""".format(
    spinach=_IMG.format(id="photo-1576045057995-568f588f82fb"),
    spinach2=_IMG.format(id="photo-1574316071802-0d684efa7bf5"),
    carrots=_IMG.format(id="photo-1598170845058-32b9d6a5da37"),
    tomatoes=_IMG.format(id="photo-1582284540020-8acbe03f4924"),
    apple=_IMG.format(id="photo-1630563451961-ac2ff27616ab"),
    shallots=_IMG.format(id="photo-1618512496248-a07fe83aa8cb"),
    chili=_IMG.format(id="photo-1622993361024-ae1c39cda16c"),
    eggs=_IMG.format(id="photo-1639194335563-d56b83f0060c"),
    chicken=_IMG.format(id="photo-1604503468506-a8da13d82791"),
    tofu=_IMG.format(id="photo-1722635940350-d1b2e5129379"),
    rice=_IMG.format(id="photo-1686820740687-426a7b9b2043"),
)


def _to_bool(value: str) -> bool:
    return str(value).strip().lower() in ("true", "1", "ya", "yes", "aktif")


def _to_int(value: str, default: int = 0) -> int:
    try:
        cleaned = str(value).strip().replace(".", "").replace(",", "")
        return int(float(cleaned)) if cleaned else default
    except (ValueError, TypeError):
        return default


def _parse_csv(text: str) -> List[dict]:
    """Parse CSV text into validated, active-only product dicts."""
    reader = csv.DictReader(io.StringIO(text))
    products: List[dict] = []
    for row in reader:
        if not row:
            continue
        normalized = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}
        pid = normalized.get("id", "")
        nama = normalized.get("nama_produk", "")
        if not pid or not nama:
            continue
        if not _to_bool(normalized.get("aktif", "")):
            continue  # only active products are exposed
        products.append(
            {
                "id": pid,
                "sku": normalized.get("sku", ""),
                "nama_produk": nama,
                "kategori": normalized.get("kategori", "Lainnya") or "Lainnya",
                "deskripsi": normalized.get("deskripsi", ""),
                "harga": _to_int(normalized.get("harga", "0")),
                "satuan": normalized.get("satuan", "pcs") or "pcs",
                "stok": _to_int(normalized.get("stok", "0")),
                "foto": normalized.get("foto", ""),
                "aktif": True,
            }
        )
    return products


def _fetch_source() -> List[dict]:
    if not SHEET_URL:
        logger.info("GOOGLE_SHEET_CSV_URL not set - using bundled mock catalog.")
        return _parse_csv(MOCK_CSV)

    logger.info("Fetching product catalog from Google Sheet CSV export.")
    try:
        resp = requests.get(SHEET_URL, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Google Sheet fetch failed: %s", exc)
        raise ProductSourceError("Katalog tidak dapat diakses saat ini.") from exc

    products = _parse_csv(resp.text)
    if not products:
        logger.error("Google Sheet returned no valid/active products.")
        raise ProductSourceError("Katalog kosong atau format tidak valid.")
    return products


def get_products(force: bool = False) -> List[dict]:
    """Return active products, served from cache when fresh."""
    now = time.time()
    if not force and _cache["data"] is not None and (now - _cache["ts"]) < CACHE_TTL:
        return _cache["data"]  # type: ignore[return-value]

    products = _fetch_source()
    _cache["data"] = products
    _cache["ts"] = now
    return products


def get_product(product_id: str) -> dict | None:
    for p in get_products():
        if p["id"] == product_id:
            return p
    return None


def get_categories() -> List[str]:
    seen: List[str] = []
    for p in get_products():
        if p["kategori"] not in seen:
            seen.append(p["kategori"])
    return seen
