"""Verify business rules:
- aktif=FALSE excluded from GET /api/products
- aktif=TRUE + stok=0 kept in list (frontend shows Habis badge)
"""
import os
import sys
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import product_service  # noqa: E402

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sayur-segar-online.preview.emergentagent.com").rstrip("/")


# --- Live API tests -----------------------------------------------------
def test_products_endpoint_excludes_minyak_goreng_aktif_false():
    r = requests.get(f"{BASE_URL}/api/products", params={"refresh": "true"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0
    # No product with 'Minyak Goreng' should be returned (row 10 aktif=FALSE)
    names = [p["nama_produk"].lower() for p in data]
    assert not any("minyak goreng" in n for n in names), f"Expected Minyak Goreng excluded, got: {names}"
    # All returned rows must have aktif True
    assert all(p["aktif"] is True for p in data)


def test_products_endpoint_minyak_goreng_direct_404():
    # id 10 exists in sheet but aktif=FALSE -> should be treated as not found
    r = requests.get(f"{BASE_URL}/api/products/10", timeout=20)
    assert r.status_code == 404


# --- Unit tests on the CSV parser --------------------------------------
CSV_BOTH_CASES = (
    "id,sku,nama_produk,kategori,deskripsi,harga,satuan,stok,foto,aktif\n"
    "10,SEM002,Minyak Goreng 1L,Sembako,desc,18000,botol,0,,FALSE\n"       # excluded
    "11,SEM003,Gula Pasir,Sembako,desc,16000,kg,0,,TRUE\n"                  # kept, stok=0
    "12,SEM004,Beras,Sembako,desc,68000,kg,5,,TRUE\n"                       # kept, stok>0
)


def test_parse_csv_filters_aktif_false_only():
    products = product_service._parse_csv(CSV_BOTH_CASES)
    ids = [p["id"] for p in products]
    assert "10" not in ids, "aktif=FALSE row must be excluded"
    assert "11" in ids, "aktif=TRUE stok=0 row must be kept (Habis badge case)"
    assert "12" in ids
    # stok preserved as int
    p11 = next(p for p in products if p["id"] == "11")
    assert p11["stok"] == 0 and p11["aktif"] is True


def test_bool_and_int_parsers():
    assert product_service._to_bool("TRUE") is True
    assert product_service._to_bool("false") is False
    assert product_service._to_bool("") is False
    assert product_service._to_int("18.000") == 18000
    assert product_service._to_int("") == 0
    assert product_service._to_int("abc", default=7) == 7
