from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from apps.server.core.database import db
from apps.server.schemas.models import Connector, ConnectorCreate

router = APIRouter(prefix="/connectors", tags=["connectors"])

@router.get("/", response_model=List[Connector])
def list_connectors():
    return db.execute("SELECT * FROM connectors")

@router.post("/{vendor_id}/auth")
def initiate_auth(vendor_id: str, auth_type: str = "OAUTH2"):
    # In a real app, this would return an OAuth redirect URL
    connector_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO connectors (id, vendor_id, auth_type, credentials, sync_status)
    VALUES ({db.escape(connector_id)}, {db.escape(vendor_id)}, {db.escape(auth_type)}, '{{"mock": "token"}}', 'PENDING')
    """
    db.execute(sql)
    return {"connector_id": connector_id, "auth_url": f"https://auth.aetherops.ai/start/{vendor_id}"}

@router.post("/{connector_id}/sync")
def trigger_sync(connector_id: str):
    # Mock Sync Logic
    import datetime
    now = datetime.datetime.now().isoformat()
    sql = f"""
    UPDATE connectors 
    SET sync_status = 'ACTIVE', last_sync_at = {db.escape(now)}
    WHERE id = {db.escape(connector_id)}
    """
    db.execute(sql)
    return {"status": "SUCCESS", "synced_at": now}
