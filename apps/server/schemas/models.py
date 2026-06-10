from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class SoftwareItemBase(BaseModel):
    name: str
    category: str # AI, CRM, ERP, HRIS, COLLAB, DEV
    provider: Optional[str] = None
    is_ai_powered: bool = False
    status: str = "MANAGED" # DISCOVERED|MANAGED|DEPRECATED
    discovery_source: str = "MANUAL" # DNS|SSO|BILLING|MANUAL
    metadata: Optional[str] = None # JSON string
    department: Optional[str] = None
    owner_email: Optional[str] = None

class SoftwareItemCreate(SoftwareItemBase):
    pass

class SoftwareItem(SoftwareItemBase):
    id: str
    created_at: str

class VendorBase(BaseModel):
    name: str
    category: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    api_capabilities: Optional[str] = None # JSON string

class VendorCreate(VendorBase):
    pass

class Vendor(VendorBase):
    id: str

class ContractBase(BaseModel):
    software_id: str
    vendor_id: str
    start_date: str
    end_date: str
    renewal_date: str
    notice_period_days: int = 30
    total_contract_value: float = 0.0
    payment_frequency: str = "ANNUAL" # MONTHLY|ANNUAL
    auto_renew: bool = True
    billing_contact_email: Optional[str] = None

class ContractCreate(ContractBase):
    pass

class Contract(ContractBase):
    id: str

class SubscriptionBase(BaseModel):
    inventory_id: str
    contract_id: str
    seat_count: int = 0
    monthly_cost: float = 0.0
    last_activity_date: Optional[str] = None
    owner_email: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: str

class ConnectorBase(BaseModel):
    vendor_id: str
    auth_type: str # OAUTH2|API_KEY
    credentials: str # JSON string (Encrypted in real world)
    sync_status: str = "PENDING" # ACTIVE|FAILED|PENDING

class ConnectorCreate(ConnectorBase):
    pass

class Connector(ConnectorBase):
    id: str
    last_sync_at: Optional[str] = None

class DiscoveryLogBase(BaseModel):
    domain: str
    findings: Optional[str] = None # JSON string

class DiscoveryLog(DiscoveryLogBase):
    id: str
    timestamp: str

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
    tool_id: str # ID from software_inventory
    payload: dict # Mock AI request payload

class GatewayProxyResponse(BaseModel):
    decision: str # ALLOWED|BLOCKED
    reason: Optional[str] = None
    mock_response: Optional[dict] = None
