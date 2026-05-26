from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str
    type: str # SAAS|INTERNAL_AGENT|CUSTOM_MODEL
    provider: Optional[str] = None
    metadata: Optional[str] = None # JSON string
    status: str = "ACTIVE" # ACTIVE|DEPRECATED|PENDING_REVIEW
    owner_email: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItem(InventoryItemBase):
    id: str
    created_at: str

class CostRecordBase(BaseModel):
    inventory_id: str
    amount: float
    currency: str = "USD"
    tokens_used: Optional[int] = 0
    period_start: str
    period_end: str

class CostRecordCreate(CostRecordBase):
    pass

class CostRecord(CostRecordBase):
    id: str

class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    rule_definition: Optional[str] = None # JSON string
    severity: str = "INFO" # INFO|WARNING|CRITICAL
    is_enabled: bool = True

class PolicyCreate(PolicyBase):
    pass

class Policy(PolicyBase):
    id: str
    created_at: str

class RecommendationBase(BaseModel):
    inventory_id: str
    category: str # COST|SECURITY|PERFORMANCE
    description: str
    potential_savings: float
    status: str = "OPEN" # OPEN|DISMISSED|IMPLEMENTED

class RecommendationCreate(RecommendationBase):
    pass

class Recommendation(RecommendationBase):
    id: str

class Alert(BaseModel):
    id: str
    message: str
    severity: str # INFO|WARNING|CRITICAL
    source_tool: str
    timestamp: str

class GatewayLog(BaseModel):
    id: str
    timestamp: str
    tool_name: str
    request_summary: str
    decision: str # ALLOWED|BLOCKED
    reason: Optional[str] = None

class GatewayProxyRequest(BaseModel):
    tool_id: str # ID from ai_inventory
    payload: dict # Mock AI request payload

class GatewayProxyResponse(BaseModel):
    decision: str # ALLOWED|BLOCKED
    reason: Optional[str] = None
    mock_response: Optional[dict] = None
