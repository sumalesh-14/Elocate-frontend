import csv
import psycopg2
from dotenv import load_dotenv
import os
from urllib.parse import urlparse, parse_qsl

# Load env variables
load_dotenv()

# CSV path (the geocoded file created by process_csv.py)
INPUT_CSV = r"C:\Users\kasum\Downloads\geocoded_facilities.csv"

# Parse DATABASE_URL
tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

# DB connection
print("Connecting to database...")
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
    print("✅ Connected to database\n")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

# Statistics
stats = {
    'total': 0,
    'imported': 0,
    'duplicates': 0,
    'errors': 0
}

# Check if input file exists
if not os.path.exists(INPUT_CSV):
    print(f"❌ Error: Input file not found: {INPUT_CSV}")
    exit(1)

print(f"Reading from: {INPUT_CSV}\n")

with open(INPUT_CSV, "r", encoding="utf-8", newline="") as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        stats['total'] += 1
        
        # Check if facility already exists
        try:
            cursor.execute(
                "SELECT COUNT(*) FROM recycling_facility WHERE name = %s AND address = %s",
                (row['name'], row['address'])
            )
            if cursor.fetchone()[0] > 0:
                print(f"⚠️  Already exists: {row['name'][:50]}")
                stats['duplicates'] += 1
                continue
            
            # Map coordinates (handle potential empty strings)
            lat = float(row['latitude']) if row['latitude'] else None
            lon = float(row['longitude']) if row['longitude'] else None
            
            if lat is None or lon is None:
                print(f"⚠️  Skipping {row['name'][:50]} (No coordinates)")
                continue

            # Insert into database using direct mapping from CSV
            cursor.execute(
                """
                INSERT INTO recycling_facility (
                    id, name, address, latitude, longitude, 
                    capacity, contact_number, operating_hours, 
                    is_verified, is_active, created_at, updated_at, 
                    geocode_source, email, state, pincode
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    row['id'], row['name'], row['address'], lat, lon,
                    int(row['capacity']), row['contact_number'], row['operating_hours'],
                    row['is_verified'] == 'True', row['is_active'] == 'True',
                    row['created_at'], row['updated_at'], 
                    row['geocode_source'], row['email'], row['state'], row['pincode']
                ),
            )
            
            print(f"✅ Inserted: {row['name'][:50]}")
            stats['imported'] += 1
            
        except Exception as e:
            print(f"❌ Error inserting {row['name'][:50]}: {e}")
            stats['errors'] += 1

# Commit all changes
conn.commit()
cursor.close()
conn.close()

# Print summary
print("\n" + "="*60)
print("Import Summary:")
print("="*60)
print(f"Total rows read:          {stats['total']}")
print(f"Successfully imported:    {stats['imported']}")
print(f"Duplicates:               {stats['duplicates']}")
print(f"Errors:                   {stats['errors']}")
print("="*60)
