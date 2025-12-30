"""
Quick database table check
"""
import os
import psycopg2
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

load_dotenv()
tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

try:
    conn = psycopg2.connect(
        host=tmpPostgres.hostname,
        database=tmpPostgres.path.replace('/', ''),
        user=tmpPostgres.username,
        password=tmpPostgres.password,
        port=5432,
        **dict(parse_qsl(tmpPostgres.query))
    )
    
    cursor = conn.cursor()
    
    # List all tables
    print("All tables in database:")
    cursor.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
    """)
    for schema, table in cursor.fetchall():
        print(f"  {schema}.{table}")
    
    # Try to query recycling_facility
    print("\n" + "="*60)
    try:
        cursor.execute("SELECT COUNT(*) FROM recycling_facility;")
        count = cursor.fetchone()[0]
        print(f"✅ recycling_facility has {count} record(s)")
        
        if count > 0:
            cursor.execute("SELECT id, name, address FROM recycling_facility LIMIT 1;")
            rec = cursor.fetchone()
            print(f"\nFirst record:")
            print(f"  ID: {rec[0]}")
            print(f"  Name: {rec[1]}")
            print(f"  Address: {rec[2]}")
    except Exception as e:
        print(f"❌ Error querying recycling_facility: {e}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Connection error: {e}")
