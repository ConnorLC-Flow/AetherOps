from fastapi import APIRouter, HTTPException
from typing import List
from core.database import db
from schemas.models import Recommendation
from services.recommendation_engine import engine

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/", response_model=List[Recommendation])
def list_recommendations():
    # Trigger engine run to refresh
    engine.run()
    rows = db.execute("SELECT * FROM recommendations")
    return rows

@router.post("/{rec_id}/apply")
def apply_recommendation(rec_id: str):
    sql = f"UPDATE recommendations SET status = 'IMPLEMENTED' WHERE id = {db.escape(rec_id)}"
    db.execute(sql)
    return {"status": "success"}
