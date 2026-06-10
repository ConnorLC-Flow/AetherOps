from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import Subscription, SubscriptionCreate

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/", response_model=List[Subscription])
def list_subscriptions():
    rows = db.execute("SELECT * FROM subscriptions")
    return rows

@router.post("/", response_model=Subscription)
def create_subscription(item: SubscriptionCreate):
    sub_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO subscriptions (id, inventory_id, contract_id, seat_count, monthly_cost, last_activity_date, owner_email)
    VALUES (
        {db.escape(sub_id)},
        {db.escape(item.inventory_id)},
        {db.escape(item.contract_id)},
        {item.seat_count},
        {item.monthly_cost},
        {db.escape(item.last_activity_date)},
        {db.escape(item.owner_email)}
    )
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM subscriptions WHERE id = {db.escape(sub_id)}")
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to create subscription")
    return rows[0]
