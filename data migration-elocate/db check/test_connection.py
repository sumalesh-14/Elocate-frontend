"""
Test database connection using DATABASE_URL from .env file
"""
import os
import psycopg2
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

# Load environment variables
load_dotenv()

# Parse DATABASE_URL
tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

print("Database Connection Details:")
print(f"  Host: {tmpPostgres.hostname}")
print(f"  Database: {tmpPostgres.path.replace('/', '')}")
print(f"  User: {tmpPostgres.username}")
print(f"  Port: 5432")
print(f"  SSL Options: {dict(parse_qsl(tmpPostgres.query))}")
print("\nAttempting to connect...")

try:
    # Connect to database
    conn = psycopg2.connect(
        host=tmpPostgres.hostname,
        database=tmpPostgres.path.replace('/', ''),
        user=tmpPostgres.username,
        password=tmpPostgres.password,
        port=5432,
        **dict(parse_qsl(tmpPostgres.query))
    )
    
    cursor = conn.cursor()
    
    # Test query
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()
    print(f"\n✅ Connection successful!")
    print(f"PostgreSQL version: {db_version[0]}")
    
    # Check if recycling_facility table exists in public schema
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'recycling_facility'
        );
    """)
    table_exists = cursor.fetchone()[0]
    
    if table_exists:
        cursor.execute("SELECT COUNT(*) FROM public.recycling_facility;")
        count = cursor.fetchone()[0]
        print(f"\n📊 Recycling_facility table exists with {count} records")
        
        # Show sample data if exists
        if count > 0:
            cursor.execute("SELECT id, name, address FROM public.recycling_facility LIMIT 3;")
            samples = cursor.fetchall()
            print("\nSample records:")
            for idx, (rec_id, name, address) in enumerate(samples, 1):
                print(f"  {idx}. {name[:50]}... ({address[:40]}...)")
    else:
        print("\n⚠️  Recycling_facility table does not exist in public schema")
        
        # List all tables in public schema for debugging
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print("\nAvailable tables in public schema:")
        for table in tables:
            print(f"  - {table[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Connection failed: {e}")
