import re
import uuid
import json
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Any
from apps.server.core.database import db
from apps.server.schemas.models import GatewayLog, GatewayProxyRequest, GatewayProxyResponse
from apps.server.core.auth import get_current_user

router = APIRouter(prefix="/gateway", tags=["gateway"])

# PII Regex patterns
PII_PATTERNS = {
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,16}\b",
    "SSN": r"\b\d{3}-\d{2}-\d{4}\b"
}

def scan_for_pii(text: str) -> List[str]:
    found = []
    for label, pattern in PII_PATTERNS.items():
        if re.search(pattern, text):
            found.append(label)
    return found

@router.post("/proxy", response_model=GatewayProxyResponse)
def gateway_proxy(request: GatewayProxyRequest, current_user: Any = Depends(get_current_user)):
    # 1. Fetch tool info
    rows = db.execute(f"SELECT name, status FROM ai_inventory WHERE id = {db.escape(request.tool_id)}")
    if not rows:
        raise HTTPException(status_code=404, detail="Tool not found in inventory")
    
    tool = rows[0]
    tool_name = tool['name']
    
    # 2. Extract request text (look for 'prompt', 'content', or 'input' fields in payload)
    payload_str = json.dumps(request.payload)
    
    decision = "ALLOWED"
    reason = "No policy violations detected."
    
    # 3. Check for blocked providers/status (example policy)
    if tool['status'] == 'DEPRECATED':
        decision = "BLOCKED"
        reason = "Tool is marked as DEPRECATED."
    
    # 4. PII Detection
    violated_pii = scan_for_pii(payload_str)
    if violated_pii:
        decision = "BLOCKED"
        reason = f"PII detected: {', '.join(violated_pii)}"

    # 5. Log decision
    log_id = str(uuid.uuid4())
    request_summary = payload_str[:100] + "..." if len(payload_str) > 100 else payload_str
    
    db.execute(f"""
        INSERT INTO gateway_logs (id, tool_name, request_summary, decision, reason)
        VALUES (
            {db.escape(log_id)},
            {db.escape(tool_name)},
            {db.escape(request_summary)},
            {db.escape(decision)},
            {db.escape(reason)}
        )
    """)

    if decision == "BLOCKED":
        raise HTTPException(status_code=403, detail={"decision": decision, "reason": reason})

    return {
        "decision": decision,
        "reason": reason,
        "mock_response": {"status": "success", "data": "This is a mock response from the AI gateway."}
    }

@router.get("/logs", response_model=List[GatewayLog])
def get_gateway_logs(current_user: Any = Depends(get_current_user)):
    rows = db.execute("SELECT * FROM gateway_logs ORDER BY timestamp DESC")
    return rows
