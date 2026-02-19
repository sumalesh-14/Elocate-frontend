"""
Script to add registration numbers to existing recycling facilities
that don't have one yet.
"""
import os
import psycopg2
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

load_dotenv()

def main():
    print("🚀 Adding registration numbers to existing facilities")
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ Error: DATABASE_URL not found in environment")
        return

    print("Connecting to database...")
    try:
        tmpPostgres = urlparse(db_url)
        conn = psycopg2.connect(
            host=tmpPostgres.hostname,
            database=tmpPostgres.path.replace('/', ''),
            user=tmpPostgres.username,
            password=tmpPostgres.password,
            port=tmpPostgres.port or 5432,
            **dict(parse_qsl(tmpPostgres.query))
        )
        cursor = conn.cursor()
        print("✅ Connected to database\n")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return

    # Get facilities without registration numbers
    cursor.execute("""
        SELECT id, name, state 
        FROM recycling_facility 
        WHERE registration_number IS NULL
        ORDER BY created_at
    """)
    
    facilities = cursor.fetchall()
    print(f"Found {len(facilities)} facilities without registration numbers\n")
    
    if len(facilities) == 0:
        print("✅ All facilities already have registration numbers!")
        cursor.close()
        conn.close()
        return
    
    updated = 0
    failed = 0
    
    for index, (facility_id, name, state) in enumerate(facilities, 1):
        # Generate registration number
        state_code = state[:3].upper() if state else "UNK"
        reg_number = f"REG-{state_code}-{index:04d}"
        
        try:
            cursor.execute("""
                UPDATE recycling_facility 
                SET registration_number = %s 
                WHERE id = %s
            """, (reg_number, facility_id))
            
            updated += 1
            print(f"[{index}/{len(facilities)}] ✅ {name[:40]:40} -> {reg_number}")
            
        except Exception as e:
            failed += 1
            print(f"[{index}/{len(facilities)}] ❌ Failed to update {name[:40]}: {e}")
            conn.rollback()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("\n" + "="*60)
    print("UPDATE SUMMARY")
    print("="*60)
    print(f"Total facilities:  {len(facilities)}")
    print(f"Updated:           {updated}")
    print(f"Failed:            {failed}")
    print("="*60)
    print("\n✅ Registration number update complete!")

if __name__ == "__main__":
    main()
