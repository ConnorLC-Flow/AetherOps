from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import Vendor, VendorCreate

router = APIRouter(prefix="/vendors", tags=["vendors"])

@router.get("/", response_model=List[Vendor])
def list_vendors():
    rows = db.execute("SELECT * FROM vendors")
    return rows

@router.post("/", response_model=Vendor)
def create_vendor(item: VendorCreate):
    vendor_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO vendors (id, name, category, website, logo_url, api_capabilities)
    VALUES (
        {db.escape(vendor_id)}, 
        {db.escape(item.name)}, 
        {db.escape(item.category)}, 
        {db.escape(item.website)}, 
        {db.escape(item.logo_url)}, 
        {db.escape(item.api_capabilities)}
    )
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM vendors WHERE id = {db.escape(vendor_id)}")
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to create vendor")
    return rows[0]
