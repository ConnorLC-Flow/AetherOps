from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import InventoryItem, InventoryItemCreate

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/", response_model=List[InventoryItem])
def list_inventory():
    rows = db.execute("SELECT * FROM ai_inventory")
    return rows

@router.post("/", response_model=InventoryItem)
def create_inventory(item: InventoryItemCreate):
    item_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO ai_inventory (id, name, type, provider, metadata, status, owner_email)
    VALUES (
        {db.escape(item_id)}, 
        {db.escape(item.name)}, 
        {db.escape(item.type)}, 
        {db.escape(item.provider)}, 
        {db.escape(item.metadata)}, 
        {db.escape(item.status)}, 
        {db.escape(item.owner_email)}
    )
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM ai_inventory WHERE id = {db.escape(item_id)}")
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to create inventory item")
    return rows[0]

@router.get("/{item_id}", response_model=InventoryItem)
def get_inventory(item_id: str):
    rows = db.execute(f"SELECT * FROM ai_inventory WHERE id = {db.escape(item_id)}")
    if not rows:
        raise HTTPException(status_code=404, detail="Item not found")
    return rows[0]
