import uuid
import datetime
import json
from apps.server.core.database import db

def seed():
    print("Seeding AetherOps v2 database...")
    
    # Clear existing data
    db.execute("DELETE FROM recommendations")
    db.execute("DELETE FROM cost_records")
    db.execute("DELETE FROM policies")
    db.execute("DELETE FROM subscriptions")
    db.execute("DELETE FROM contracts")
    db.execute("DELETE FROM software_inventory")
    db.execute("DELETE FROM vendors")
    db.execute("DELETE FROM discovery_logs")
    db.execute("DELETE FROM connectors")
    
    # 1. Vendors
    vendors = [
        ('v1', 'OpenAI', 'AI', 'https://openai.com'),
        ('v2', 'Anthropic', 'AI', 'https://anthropic.com'),
        ('v3', 'Microsoft', 'Infrastructure', 'https://microsoft.com'),
        ('v4', 'Google', 'Collab', 'https://google.com'),
        ('v5', 'Slack', 'Collab', 'https://slack.com'),
        ('v6', 'GitHub', 'Dev', 'https://github.com'),
        ('v7', 'Notion', 'Collab', 'https://notion.so'),
        ('v8', 'Zoom', 'Collab', 'https://zoom.us'),
    ]
    for id, name, cat, site in vendors:
        db.execute(f"INSERT INTO vendors (id, name, category, website) VALUES ({db.escape(id)}, {db.escape(name)}, {db.escape(cat)}, {db.escape(site)})")

    # 2. Software Inventory (Generalized)
    tools = [
        ("t1", "OpenAI GPT-4", "AI", "OpenAI", 1, "MANAGED", "MANUAL", json.dumps({"model": "gpt-4-turbo"}), "IT", "cto@aetherops.ai"),
        ("t2", "Anthropic Claude 3.5 Sonnet", "AI", "Anthropic", 1, "MANAGED", "MANUAL", json.dumps({"model": "claude-3-5-sonnet"}), "Marketing", "marketing@aetherops.ai"),
        ("s1", "Slack", "COLLAB", "Slack", 0, "MANAGED", "DNS", "{}", "Engineering", "eng-leads@aetherops.ai"),
        ("s2", "GitHub", "DEV", "GitHub", 0, "MANAGED", "SSO", "{}", "Engineering", "cto@aetherops.ai"),
        ("s3", "Notion", "COLLAB", "Notion", 0, "MANAGED", "SSO", "{}", "Product", "pm@aetherops.ai"),
        ("s4", "Zoom", "COLLAB", "Zoom", 0, "MANAGED", "Billing", "{}", "Sales", "sales@aetherops.ai"),
    ]
    
    for id, name, cat, prov, ai, status, src, meta, dept, email in tools:
        sql = f"""
        INSERT INTO software_inventory (id, name, category, provider, is_ai_powered, status, discovery_source, metadata, department, owner_email)
        VALUES ({db.escape(id)}, {db.escape(name)}, {db.escape(cat)}, {db.escape(prov)}, {ai}, {db.escape(status)}, {db.escape(src)}, {db.escape(meta)}, {db.escape(dept)}, {db.escape(email)})
        """
        db.execute(sql)
        
    # 3. Contracts
    today = datetime.date.today()
    contracts = [
        ('c1', 's1', 'v5', '2026-01-01', '2027-01-01', '2027-01-01', 30, 12000.0, 'ANNUAL', 1, 'finance@aetherops.ai'),
        ('c2', 's2', 'v6', '2026-03-15', '2027-03-15', '2027-03-15', 60, 5000.0, 'ANNUAL', 1, 'it@aetherops.ai'),
        ('c3', 't1', 'v1', (today - datetime.timedelta(days=15)).isoformat(), (today + datetime.timedelta(days=15)).isoformat(), (today + datetime.timedelta(days=15)).isoformat(), 7, 2000.0, 'MONTHLY', 1, 'cto@aetherops.ai'),
    ]
    for cid, sid, vid, start, end, renew, notice, val, freq, auto, email in contracts:
        sql = f"""
        INSERT INTO contracts (id, software_id, vendor_id, start_date, end_date, renewal_date, notice_period_days, total_contract_value, payment_frequency, auto_renew, billing_contact_email)
        VALUES ({db.escape(cid)}, {db.escape(sid)}, {db.escape(vid)}, {db.escape(start)}, {db.escape(end)}, {db.escape(renew)}, {notice}, {val}, {db.escape(freq)}, {auto}, {db.escape(email)})
        """
        db.execute(sql)

    # 4. Subscriptions
    subs = [
        ('sub1', 's1', 'c1', 100, 1000.0, (today - datetime.timedelta(days=1)).isoformat(), 'eng-leads@aetherops.ai'),
        ('sub2', 's2', 'c2', 50, 416.67, (today - datetime.timedelta(days=2)).isoformat(), 'cto@aetherops.ai'),
        ('sub3', 't1', 'c3', 10, 2000.0, today.isoformat(), 'cto@aetherops.ai'),
    ]
    for sid, invid, cid, seats, cost, last, email in subs:
        sql = f"""
        INSERT INTO subscriptions (id, inventory_id, contract_id, seat_count, monthly_cost, last_activity_date, owner_email)
        VALUES ({db.escape(sid)}, {db.escape(invid)}, {db.escape(cid)}, {seats}, {cost}, {db.escape(last)}, {db.escape(email)})
        """
        db.execute(sql)

    # 5. Cost Records
    costs = [
        (str(uuid.uuid4()), "t1", 150.50, "USD", 500000, "2026-05-01", "2026-05-31"),
        (str(uuid.uuid4()), "t2", 85.00, "USD", 250000, "2026-05-01", "2026-05-31"),
        (str(uuid.uuid4()), "s1", 1000.00, "USD", 0, "2026-05-01", "2026-05-31"),
    ]
    for id, tool_id, amount, currency, tokens, start, end in costs:
        sql = f"""
        INSERT INTO cost_records (id, inventory_id, amount, currency, tokens_used, period_start, period_end)
        VALUES ({db.escape(id)}, {db.escape(tool_id)}, {amount}, {db.escape(currency)}, {tokens}, {db.escape(start)}, {db.escape(end)})
        """
        db.execute(sql)

    # 6. Policies
    policies = [
        (str(uuid.uuid4()), "Block PII Inputs", "Detect and redact credit card numbers and SSNs from model prompts.", json.dumps({"pattern": "cc_regex"}), "CRITICAL", 1),
        (str(uuid.uuid4()), "SaaS Compliance Review", "All discovered tools must be promoted to Managed within 14 days.", json.dumps({"status": "discovered"}), "WARNING", 1),
    ]
    for id, name, desc, rule, severity, enabled in policies:
        sql = f"""
        INSERT INTO policies (id, name, description, rule_definition, severity, is_enabled)
        VALUES ({db.escape(id)}, {db.escape(name)}, {db.escape(desc)}, {db.escape(rule)}, {db.escape(severity)}, {enabled})
        """
        db.execute(sql)

    print("Seeding complete.")

if __name__ == "__main__":
    seed()
