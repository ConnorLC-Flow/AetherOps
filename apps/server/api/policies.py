from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import Policy, PolicyCreate

router = APIRouter(prefix="/policies", tags=["policies"])

@router.get("/", response_model=List[Policy])
def list_policies():
    rows = db.execute("SELECT * FROM policies")
    return rows

@router.post("/", response_model=Policy)
def create_policy(item: PolicyCreate):
    policy_id = str(uuid.uuid4())
    enabled = 1 if item.is_enabled else 0
    sql = f"""
    INSERT INTO policies (id, name, description, rule_definition, severity, is_enabled)
    VALUES (
        {db.escape(policy_id)}, 
        {db.escape(item.name)}, 
        {db.escape(item.description)}, 
        {db.escape(item.rule_definition)}, 
        {db.escape(item.severity)}, 
        {enabled}
    )
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM policies WHERE id = {db.escape(policy_id)}")
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to create policy")
    return rows[0]

@router.put("/{policy_id}", response_model=Policy)
def update_policy(policy_id: str, item: PolicyCreate):
    enabled = 1 if item.is_enabled else 0
    sql = f"""
    UPDATE policies 
    SET name = {db.escape(item.name)}, 
        description = {db.escape(item.description)}, 
        rule_definition = {db.escape(item.rule_definition)}, 
        severity = {db.escape(item.severity)}, 
        is_enabled = {enabled}
    WHERE id = {db.escape(policy_id)}
    """
    db.execute(sql)
    rows = db.execute(f"SELECT * FROM policies WHERE id = {db.escape(policy_id)}")
    if not rows:
        raise HTTPException(status_code=404, detail="Policy not found")
    return rows[0]
