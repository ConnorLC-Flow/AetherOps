from fastapi import APIRouter, Depends
from typing import List, Any
from core.database import db
from schemas.models import Alert
from core.auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[Alert])
def list_alerts(current_user: Any = Depends(get_current_user)):
    # Fetch policies and inventory to derive alerts
    policies = db.execute("SELECT * FROM policies")
    inventory = db.execute("SELECT * FROM ai_inventory")
    
    alerts = []
    
    # Alert 1: PII Detection (Critical)
    gpt4 = next((item for item in inventory if "GPT-4" in item['name']), None)
    pii_policy = next((p for p in policies if "PII" in p['name']), None)
    if gpt4 and pii_policy:
        alerts.append({
            "id": "alert-1",
            "message": f"Policy Violation: {pii_policy['name']} - Potential SSN detected in prompt.",
            "severity": pii_policy['severity'],
            "source_tool": gpt4['name'],
            "timestamp": "2026-05-07 09:15:00"
        })

    # Alert 2: Unapproved Tool (Warning)
    pending_tool = next((item for item in inventory if item['status'] == 'PENDING_REVIEW'), None)
    approval_policy = next((p for p in policies if "Approval" in p['name']), None)
    if pending_tool and approval_policy:
        alerts.append({
            "id": "alert-2",
            "message": f"Compliance Alert: {pending_tool['name']} requires operational review.",
            "severity": approval_policy['severity'],
            "source_tool": pending_tool['name'],
            "timestamp": "2026-05-07 08:41:11"
        })

    # Alert 3: Custom Model usage (Info)
    custom_model = next((item for item in inventory if item['type'] == 'CUSTOM_MODEL'), None)
    if custom_model:
        alerts.append({
            "id": "alert-3",
            "message": f"Monitoring: {custom_model['name']} (Custom Model) is being utilized by Finance.",
            "severity": "INFO",
            "source_tool": custom_model['name'],
            "timestamp": "2026-05-07 08:30:00"
        })

    # Sort by timestamp descending (even though they are hardcoded for now)
    alerts.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return alerts[:10]
