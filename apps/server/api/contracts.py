from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import Contract, ContractCreate

router = APIRouter(prefix="/contracts", tags=["contracts"])

@router.get("/", response_model=List[Contract])
def list_contracts():
    rows = db.execute("SELECT * FROM contracts")
    return rows

@router.post("/", response_model=Contract)
def create_contract(item: ContractCreate):
    item_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO contracts (id, software_id, vendor_id, start_date, end_date, renewal_date, notice_period_days, total_contract_value, payment_frequency, auto_renew, billing_contact_email)
    VALUES (
        {db.escape(item_id)},
        {db.escape(item.software_id)},
        {db.escape(item.vendor_id)},
        {db.escape(item.start_date)},
        {db.escape(item.end_date)},
        {db.escape(item.renewal_date)},
        {item.notice_period_days},
        {item.total_contract_value},
        {db.escape(item.payment_frequency)},
        {1 if item.auto_renew else 0},
        {db.escape(item.billing_contact_email)}
    )
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM contracts WHERE id = {db.escape(item_id)}")
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to create contract")
    return rows[0]

@router.get("/timeline")
def get_timeline():
    # Gantt-friendly renewal data
    sql = """
    SELECT 
        c.id, 
        s.name as software_name, 
        v.name as vendor_name, 
        c.start_date, 
        c.end_date, 
        c.renewal_date,
        c.total_contract_value
    FROM contracts c
    JOIN software_inventory s ON c.software_id = s.id
    JOIN vendors v ON c.vendor_id = v.id
    """
    return db.execute(sql)
