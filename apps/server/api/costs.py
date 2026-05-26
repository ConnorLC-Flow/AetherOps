from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import CostRecord, CostRecordCreate

router = APIRouter(prefix="/costs", tags=["costs"])

@router.get("/", response_model=List[CostRecord])
def list_costs():
    rows = db.execute("SELECT * FROM cost_records")
    return rows

@router.post("/", response_model=CostRecord)
def create_cost(item: CostRecordCreate):
    record_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO cost_records (id, inventory_id, amount, currency, tokens_used, period_start, period_end)
    VALUES (
        {db.escape(record_id)}, 
        {db.escape(item.inventory_id)}, 
        {item.amount}, 
        {db.escape(item.currency)}, 
        {item.tokens_used}, 
        {db.escape(item.period_start)}, 
        {db.escape(item.period_end)}
    )
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM cost_records WHERE id = {db.escape(record_id)}")
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to create cost record")
    return rows[0]

@router.get("/breakdown")
def get_cost_breakdown():
    # Cost per tool/provider
    sql = """
    SELECT i.provider, i.name as tool_name, SUM(c.amount) as total_amount, c.currency
    FROM cost_records c
    JOIN ai_inventory i ON c.inventory_id = i.id
    GROUP BY i.provider, i.name, c.currency
    """
    return db.execute(sql)
