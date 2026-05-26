import os
import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api import inventory, costs, policies, recommendations, auth, alerts, gateway
from core.database import db
from core.auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Create tables if they don't exist."""
    logger.info("Initializing database schema...")
    
    # Create AI Inventory table
    db.execute("""
        CREATE TABLE IF NOT EXISTS ai_inventory (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            provider TEXT NOT NULL,
            metadata TEXT,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            owner_email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create Cost Records table
    db.execute("""
        CREATE TABLE IF NOT EXISTS cost_records (
            id TEXT PRIMARY KEY,
            inventory_id TEXT NOT NULL,
            amount REAL NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'USD',
            tokens_used INTEGER DEFAULT 0,
            period_start TEXT,
            period_end TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inventory_id) REFERENCES ai_inventory(id)
        )
    """)
    
    # Create Policies table
    db.execute("""
        CREATE TABLE IF NOT EXISTS policies (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            rule_definition TEXT,
            severity TEXT NOT NULL DEFAULT 'INFO',
            is_enabled INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create Recommendations table
    db.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id TEXT PRIMARY KEY,
            inventory_id TEXT,
            type TEXT NOT NULL,
            priority TEXT NOT NULL DEFAULT 'MEDIUM',
            title TEXT NOT NULL,
            description TEXT,
            potential_savings REAL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'OPEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inventory_id) REFERENCES ai_inventory(id)
        )
    """)
    
    # Create Gateway Logs table
    db.execute("""
        CREATE TABLE IF NOT EXISTS gateway_logs (
            id TEXT PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            action TEXT NOT NULL,
            decision TEXT NOT NULL,
            reason TEXT,
            request_data TEXT
        )
    """)
    
    logger.info("Database schema initialized.")

def seed():
    """Seed initial data if tables are empty."""
    logger.info("Checking if seed data is needed...")
    
    result = db.execute("SELECT COUNT(*) as cnt FROM ai_inventory")
    count = result[0]['cnt'] if result else 0
    
    if count > 0:
        logger.info(f"Database already has {count} items, skipping seed.")
        return
    
    logger.info("Seeding initial data...")
    import uuid
    import datetime
    import json
    
    # 1. AI Inventory
    tools = [
        ("t1", "OpenAI GPT-4", "SAAS", "OpenAI", json.dumps({"model": "gpt-4-turbo"}), "ACTIVE", "cto@aetherops.ai"),
        ("t2", "Anthropic Claude 3.5 Sonnet", "SAAS", "Anthropic", json.dumps({"model": "claude-3-5-sonnet-20240620"}), "ACTIVE", "marketing@aetherops.ai"),
        ("t3", "Azure OpenAI Service", "SAAS", "Microsoft", json.dumps({"deployment": "gpt-4-prod"}), "ACTIVE", "it-ops@aetherops.ai"),
        ("t4", "Internal Customer Support Bot", "INTERNAL_AGENT", "In-house", json.dumps({"engine": "gpt-4o-mini"}), "ACTIVE", "support@aetherops.ai"),
        ("t5", "Code Review Assistant", "INTERNAL_AGENT", "In-house", json.dumps({"tools": ["git", "lint"]}), "PENDING_REVIEW", "dev@aetherops.ai"),
        ("t6", "Financial Forecaster", "CUSTOM_MODEL", "In-house", json.dumps({"base": "llama-3"}), "ACTIVE", "finance@aetherops.ai"),
    ]
    
    for id, name, type, provider, meta, status, email in tools:
        db.execute(f"""
        INSERT INTO ai_inventory (id, name, type, provider, metadata, status, owner_email)
        VALUES ({db.escape(id)}, {db.escape(name)}, {db.escape(type)}, {db.escape(provider)}, {db.escape(meta)}, {db.escape(status)}, {db.escape(email)})
        """)
    
    # 2. Cost Records
    today = datetime.date.today().isoformat()
    last_week = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
    
    costs = [
        (str(uuid.uuid4()), "t1", 150.50, "USD", 500000, last_week, today),
        (str(uuid.uuid4()), "t2", 85.00, "USD", 250000, last_week, today),
        (str(uuid.uuid4()), "t3", 120.00, "USD", 400000, last_week, today),
        (str(uuid.uuid4()), "t4", 12.50, "USD", 1000000, last_week, today),
        (str(uuid.uuid4()), "t6", 45.00, "USD", 0, last_week, today),
    ]
    
    for id, tool_id, amount, currency, tokens, start, end in costs:
        db.execute(f"""
        INSERT INTO cost_records (id, inventory_id, amount, currency, tokens_used, period_start, period_end)
        VALUES ({db.escape(id)}, {db.escape(tool_id)}, {amount}, {db.escape(currency)}, {tokens}, {db.escape(start)}, {db.escape(end)})
        """)
    
    # 3. Policies
    policies = [
        (str(uuid.uuid4()), "Block PII Inputs", "Detect and redact credit card numbers and SSNs from model prompts.", json.dumps({"pattern": "cc_regex"}), "CRITICAL", 1),
        (str(uuid.uuid4()), "Require Approval for New Tools", "All new AI tool registrations must be reviewed by IT Ops.", json.dumps({"status": "pending"}), "WARNING", 1),
        (str(uuid.uuid4()), "Usage Cap Notification", "Alert owners when monthly spend exceeds $500.", json.dumps({"threshold": 500}), "INFO", 0),
    ]
    
    for id, name, desc, rule, severity, enabled in policies:
        db.execute(f"""
        INSERT INTO policies (id, name, description, rule_definition, severity, is_enabled)
        VALUES ({db.escape(id)}, {db.escape(name)}, {db.escape(desc)}, {db.escape(rule)}, {db.escape(severity)}, {enabled})
        """)

    # 4. Recommendations
    recommendations = [
        (str(uuid.uuid4()), "t5", "APPROVAL_QUEUE", "HIGH", "Approve Code Review Assistant", "Based on usage patterns, this tool has high ROI potential.", 80.00, "OPEN"),
        (str(uuid.uuid4()), "t1", " Downscaling", "MEDIUM", "Optimize GPT-4 Usage", "Reduce token usage by enabling caching and batch processing.", 120.00, "OPEN"),
        (str(uuid.uuid4()), "t2", "VENDOR", "LOW", "Negotiate Claude Pricing", "Current spend qualifies for volume discounts.", 35.00, "OPEN"),
        (str(uuid.uuid4()), "t4", "POLICY", "HIGH", "Enable Cost Cap Policy", "Set monthly spending limit on customer support bot.", 25.00, "OPEN"),
    ]
    
    for id, tool_id, rec_type, priority, title, desc, savings, status in recommendations:
        db.execute(f"""
        INSERT INTO recommendations (id, inventory_id, type, priority, title, description, potential_savings, status)
        VALUES ({db.escape(id)}, {db.escape(tool_id)}, {db.escape(rec_type)}, {db.escape(priority)}, {db.escape(title)}, {db.escape(desc)}, {savings}, {db.escape(status)})
        """)
    
    logger.info("Seeding complete.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    seed()
    yield
    # Shutdown (nothing to clean up)

app = FastAPI(title="AetherOps API", version="0.1.0", lifespan=lifespan)

# Enable CORS for frontend
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public endpoints
app.include_router(auth.router, prefix="/api/v1")

# Protected endpoints
app.include_router(inventory.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(costs.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(policies.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(recommendations.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(alerts.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(gateway.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])

@app.get("/")
def read_root():
    return {"message": "Welcome to AetherOps API", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)