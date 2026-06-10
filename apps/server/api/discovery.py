from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
import datetime
from apps.server.core.database import db
from apps.server.schemas.models import DiscoveryLog

router = APIRouter(prefix="/discovery", tags=["discovery"])

@router.post("/scan")
def trigger_scan(domain: str):
    # Mock Discovery Logic
    # In v2 real world, this would use dnspython, etc.
    scan_id = str(uuid.uuid4())
    findings = [
        {"tool": "Slack", "subdomain": f"slack.{domain}", "type": "DNS_TXT", "confidence": 0.95},
        {"tool": "GitHub", "subdomain": f"github.{domain}", "type": "SSO_LOG", "confidence": 0.99},
        {"tool": "Zoom", "subdomain": f"zoom.{domain}", "type": "MX_RECORD", "confidence": 0.85},
        {"tool": "Notion", "subdomain": f"notion.{domain}", "type": "SSO_LOG", "confidence": 0.90}
    ]
    
    import json
    findings_str = json.dumps(findings)
    
    sql = f"""
    INSERT INTO discovery_logs (id, domain, findings)
    VALUES ({db.escape(scan_id)}, {db.escape(domain)}, {db.escape(findings_str)})
    """
    db.execute(sql)
    
    return {"scan_id": scan_id, "status": "COMPLETED", "findings": findings}

@router.get("/results", response_model=List[DiscoveryLog])
def list_discovery_results():
    return db.execute("SELECT * FROM discovery_logs ORDER BY timestamp DESC")

@router.post("/promote")
def promote_to_inventory(tool_name: str, category: str):
    # Move a discovered tool to Managed Inventory
    item_id = str(uuid.uuid4())
    sql = f"""
    INSERT INTO software_inventory (id, name, category, status, discovery_source)
    VALUES ({db.escape(item_id)}, {db.escape(tool_name)}, {db.escape(category)}, 'MANAGED', 'DISCOVERY')
    """
    db.execute(sql)
    return {"id": item_id, "name": tool_name, "status": "MANAGED"}
