export type AssetType = 'AI' | 'CRM' | 'ERP' | 'HRIS' | 'COLLAB' | 'DEV' | 'MARKETING' | 'SECURITY' | 'OTHER';
export type AssetStatus = 'DISCOVERED' | 'MANAGED' | 'DEPRECATED';

export interface SoftwareAsset {
  id: string;
  name: string;
  category: AssetType;
  provider: string;
  is_ai_powered: boolean;
  status: AssetStatus;
  discovery_source?: string;
  owner_email?: string;
  department?: string;
  last_activity_date?: string;
  monthly_cost?: number;
  contract_status?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  website?: string;
  logo_url?: string;
  api_capabilities?: {
    oauth?: boolean;
    usage_pulls?: boolean;
    billing_sync?: boolean;
  };
}

export interface Contract {
  id: string;
  software_id: string;
  vendor_id: string;
  vendor_name?: string; // Joined for UI
  software_name?: string; // Joined for UI
  start_date: string;
  end_date: string;
  renewal_date: string;
  notice_period_days: number;
  total_contract_value: number;
  payment_frequency: 'MONTHLY' | 'ANNUAL';
  auto_renew: boolean;
  billing_contact_email: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'RENEWING';
}

export interface Connector {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  auth_type: 'OAUTH2' | 'API_KEY';
  sync_status: 'ACTIVE' | 'FAILED' | 'PENDING';
  last_sync_at: string;
}

export interface DiscoveryResult {
  id: string;
  name: string;
  domain: string;
  confidence_score: number;
  source: string;
  detected_at: string;
}

export interface CostRecord {
  id: string;
  inventory_id: string;
  amount: number;
  currency: string;
  tokens_used: number;
  period_start: string;
  period_end: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  is_enabled: boolean;
  created_at: string;
}

export interface Recommendation {
  id: string;
  inventory_id: string;
  category: 'COST' | 'SECURITY' | 'PERFORMANCE';
  description: string;
  potential_savings: number;
  status: 'OPEN' | 'DISMISSED' | 'IMPLEMENTED';
}

export interface Alert {
  id: string;
  policy_id?: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status?: 'UNREAD' | 'READ' | 'DISMISSED';
  timestamp: string;
  source_tool?: string;
}

export interface GatewayLog {
  id: string;
  timestamp: string;
  tool_name: string;
  request_summary: string;
  decision: 'ALLOWED' | 'BLOCKED';
  reason: string;
}
