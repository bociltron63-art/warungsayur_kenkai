"""Backend API tests for Warung Sayur KenKai."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---- /api/config ----
def test_config(s):
    r = s.get(f"{API}/config", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["brand"] == "Warung Sayur KenKai"
    assert "owner_whatsapp_number" in d and isinstance(d["owner_whatsapp_number"], str)
    assert isinstance(d["service_areas"], list) and len(d["service_areas"]) >= 1


# ---- /api/products ----
def test_products_list(s):
    r = s.get(f"{API}/products", timeout=15)
    assert r.status_code == 200
    prods = r.json()
    assert isinstance(prods, list)
    # 13 active products (014 inactive excluded)
    assert len(prods) == 13
    ids = [p["id"] for p in prods]
    assert "014" not in ids, "Inactive Kecap Manis (014) should be excluded"
    assert "012" in ids, "Out-of-stock Minyak Goreng (012) should be included"
    p012 = next(p for p in prods if p["id"] == "012")
    assert p012["stok"] == 0
    assert p012["aktif"] is True
    # Every product retains satuan
    for p in prods:
        assert p["satuan"], f"Product {p['id']} missing satuan"


def test_products_has_expected_satuans(s):
    r = s.get(f"{API}/products").json()
    satuans = {p["id"]: p["satuan"] for p in r}
    assert satuans["001"] == "ikat"
    assert satuans["003"] == "kg"
    assert satuans["008"] == "pcs"
    assert satuans["010"] == "bungkus"
    assert satuans["012"] == "botol"


# ---- /api/categories ----
def test_categories(s):
    r = s.get(f"{API}/categories", timeout=15)
    assert r.status_code == 200
    cats = r.json()
    assert isinstance(cats, list)
    for expected in ["Sayuran", "Buah", "Bumbu Dapur", "Protein", "Telur", "Sembako", "Kebutuhan Dapur"]:
        assert expected in cats
    # Should not contain 'Lainnya' from inactive product 014
    assert "Lainnya" not in cats


# ---- /api/products/{id} ----
def test_product_by_id(s):
    r = s.get(f"{API}/products/001")
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == "001"
    assert d["nama_produk"] == "Bayam Segar"
    assert d["satuan"] == "ikat"


def test_product_not_found(s):
    r = s.get(f"{API}/products/999")
    assert r.status_code == 404


def test_inactive_product_not_accessible(s):
    r = s.get(f"{API}/products/014")
    assert r.status_code == 404


# ---- /api/order-number ----
def test_order_number_format_and_increment(s):
    r1 = s.post(f"{API}/order-number")
    assert r1.status_code == 200
    on1 = r1.json()["order_number"]
    assert re.match(r"^KKN-\d{8}-\d{3}$", on1), f"Bad format: {on1}"

    r2 = s.post(f"{API}/order-number")
    on2 = r2.json()["order_number"]
    assert re.match(r"^KKN-\d{8}-\d{3}$", on2)
    # same day, seq must increment
    seq1 = int(on1.rsplit("-", 1)[1])
    seq2 = int(on2.rsplit("-", 1)[1])
    assert seq2 == seq1 + 1
