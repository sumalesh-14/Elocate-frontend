import pandas as pd
import os
import time
import re
import uuid
import psycopg2
from datetime import datetime
from geopy.geocoders import Nominatim
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

# Load env variables
load_dotenv()

# File paths
INPUT_FILE = r"C:\Users\kasum\Downloads\RecyclerRegistrationGrantedList.xlsx"

# Geocoder (FREE – OpenStreetMap)
geolocator = Nominatim(user_agent="elocate_full_migrator")

def extract_pincode(address):
    """Extract 6-digit Indian PIN code from address"""
    if pd.isna(address):
        return None
    match = re.search(r'\b\d{6}\b', str(address))
    return match.group(0) if match else None

def get_lat_lon_smart(address, state):
    """Smart geocoding priority for Indian addresses"""
    pincode = extract_pincode(address)
    
    strategies = [
        ("PIN", f"{pincode}, {state}, India" if pincode else None),
        ("FULL_ADDRESS", f"{address}, {state}, India"),
    ]
    
    for strategy_name, query in strategies:
        if not query:
            continue
        try:
            location = geolocator.geocode(query, timeout=10)
            time.sleep(1.2)  # Rate limiting
            if location:
                return location.latitude, location.longitude, strategy_name
        except Exception:
            pass
    return None, None, "FAILED"

def main():
    print("🚀 Starting Direct XLSX -> PostgreSQL Migration")
    
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: Input file not found: {INPUT_FILE}")
        return

    # Database connection
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

    # Read Excel
    try:
        print(f"Reading: {INPUT_FILE}")
        df = pd.read_excel(INPUT_FILE)
        print(f"Successfully loaded {len(df)} rows.\n")
    except Exception as e:
        print(f"❌ Error reading Excel: {e}")
        return

    # Column mapping helper
    def find_col(possible_names):
        for name in possible_names:
            for col in df.columns:
                if name.lower() in str(col).lower():
                    return col
        return None

    name_col = find_col(['Company Name', 'Name', 'Unit Name'])
    address_col = find_col(['Address'])
    state_col = find_col(['State'])
    email_col = find_col(['Email'])

    stats = {'total': 0, 'imported': 0, 'duplicates': 0, 'failed_geocode': 0, 'skipped': 0}

    for index, row in df.iterrows():
        stats['total'] += 1
        
        name = str(row[name_col]).strip() if name_col and pd.notna(row[name_col]) else "Unknown"
        address = str(row[address_col]).strip() if address_col and pd.notna(row[address_col]) else None
        state = str(row[state_col]).strip().upper() if state_col and pd.notna(row[state_col]) else "UNKNOWN"
        email = str(row[email_col]).strip() if email_col and pd.notna(row[email_col]) else ""

        if not address:
            print(f"⚠️ Row {index+2}: Missing address, skipping.")
            stats['skipped'] += 1
            continue

        print(f"[{stats['total']}/{len(df)}] Processing: {name[:50]}...")

        # 1. Duplicate check
        cursor.execute(
            "SELECT COUNT(*) FROM recycling_facility WHERE name = %s AND address = %s",
            (name, address)
        )
        if cursor.fetchone()[0] > 0:
            print(f"  ⚠️ Already exists in DB.")
            stats['duplicates'] += 1
            continue

        # 2. Geocode
        lat, lon, source = get_lat_lon_smart(address, state)
        if not lat or not lon:
            print(f"  ❌ Geocoding failed.")
            stats['failed_geocode'] += 1
            # We skip if geocoding fails as coordinates are likely required
            continue

        # 3. Insert
        try:
            now = datetime.utcnow().isoformat()
            pincode = extract_pincode(address)
            
            # Generate registration number from state and index
            reg_number = f"REG-{state[:3]}-{stats['total']:04d}"
            
            cursor.execute(
                """
                INSERT INTO recycling_facility (
                    id, name, address, latitude, longitude, 
                    capacity, contact_number, operating_hours, 
                    is_verified, is_active, created_at, updated_at, 
                    geocode_source, email, state, pincode, registration_number
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    str(uuid.uuid4()), name, address, lat, lon,
                    1000, '', '9AM-6PM', False, True, now, now,
                    source, email, state, pincode, reg_number
                )
            )
            stats['imported'] += 1
            print(f"  ✅ Inserted ({lat}, {lon}) - Reg: {reg_number}")
        except Exception as e:
            print(f"  ❌ Insert failed: {e}")
            conn.rollback()

    conn.commit()
    cursor.close()
    conn.close()

    print("\n" + "="*60)
    print("MIGRATION SUMMARY")
    print("="*60)
    print(f"Total rows:        {stats['total']}")
    print(f"Imported:          {stats['imported']}")
    print(f"Duplicates:        {stats['duplicates']}")
    print(f"Geocoding Failed:  {stats['failed_geocode']}")
    print(f"Skipped:           {stats['skipped']}")
    print("="*60)
    print("\n✅ Migration Finished!")

if __name__ == "__main__":
    main()
