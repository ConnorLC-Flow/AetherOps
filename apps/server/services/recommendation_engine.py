from core.database import db
import uuid

class RecommendationEngine:
    def run(self):
        recommendations = []
        
        # Simple rule: Tools with high total spend
        high_spend_tools = db.execute("""
            SELECT i.id, i.name, SUM(c.amount) as total_spend
            FROM ai_inventory i
            JOIN cost_records c ON i.id = c.inventory_id
            GROUP BY i.id, i.name
            HAVING total_spend > 50.0
        """)
        
        for tool in high_spend_tools:
            rec = {
                "id": str(uuid.uuid4()),
                "inventory_id": tool["id"],
                "category": "COST",
                "description": f"High spend detected for '{tool['name']}' (${tool['total_spend']}). Consider model distillation or usage caps.",
                "potential_savings": tool["total_spend"] * 0.2,
                "status": "OPEN"
            }
            recommendations.append(rec)
            
        # Save recommendations to DB
        for rec in recommendations:
            exists = db.execute(f"SELECT * FROM recommendations WHERE inventory_id = {db.escape(rec['inventory_id'])} AND category = {db.escape(rec['category'])} AND status = 'OPEN'")
            if not exists:
                sql = f"""
                INSERT INTO recommendations (id, inventory_id, category, description, potential_savings, status)
                VALUES (
                    {db.escape(rec['id'])}, 
                    {db.escape(rec['inventory_id'])}, 
                    {db.escape(rec['category'])}, 
                    {db.escape(rec['description'])}, 
                    {rec['potential_savings']}, 
                    {db.escape(rec['status'])}
                )
                """
                db.execute(sql)
        
        return recommendations

engine = RecommendationEngine()
