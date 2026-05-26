import os
import json
import logging
import subprocess
import sqlite3
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class TeamDB:
    def __init__(self):
        self.url = os.getenv("TEAM_DB_URL")
        self.token = os.getenv("TEAM_DB_AUTH_TOKEN")
        self.db_path = os.getenv("DB_PATH", "/tmp/aetherops.db")
        self.use_libsql = False
        
        if self.url and self.url.startswith("libsql://"):
            try:
                import libsql_client
                self.client = libsql_client.create_client(url=self.url, auth_token=self.token)
                self.use_libsql = True
                logger.info("Using libsql-client for database connection")
            except ImportError:
                logger.warning("libsql-client not found, falling back to sqlite3")

    def _get_sqlite_connection(self):
        db_dir = os.path.dirname(self.db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def execute(self, sql: str) -> List[Dict[str, Any]]:
        logger.info(f"Executing SQL: {sql}")
        if self.use_libsql:
            try:
                rs = self.client.execute(sql)
                columns = rs.columns
                return [dict(zip(columns, row)) for row in rs.rows]
            except Exception as e:
                logger.error(f"libsql error: {e}")
                raise RuntimeError(f"Database error: {e}")
        else:
            # Use SQLite directly (works in Docker containers)
            # team-db CLI is only available in the sandbox environment
            try:
                conn = self._get_sqlite_connection()
                cursor = conn.cursor()
                cursor.execute(sql)
                
                # Check if it's a SELECT query
                if sql.strip().upper().startswith("SELECT"):
                    rows = cursor.fetchall()
                    columns = [desc[0] for desc in cursor.description]
                    result = [dict(zip(columns, row)) for row in rows]
                else:
                    conn.commit()
                    result = []
                    
                conn.close()
                return result
            except Exception as e:
                logger.error(f"SQLite error: {e}")
                raise RuntimeError(f"Database error: {e}")

    def escape(self, val: Any) -> str:
        if val is None:
            return "NULL"
        if isinstance(val, str):
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return str(val)

db = TeamDB()