export type AIAssetType = 'SAAS' | 'INTERNAL_AGENT' | 'CUSTOM_MODEL';

export interface AIAsset {
  id: string;
  name: string;
  type: AIAssetType;
  provider: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'PENDING_REVIEW';
  owner_email: string;
  created_at: string;
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
