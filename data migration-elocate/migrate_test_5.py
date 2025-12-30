import pandas as pd
import os
import time
import re
import uuid
import csv
from datetime import datetime
from geopy.geocoders import Nominatim
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# File paths
INPUT_FILE = r"C:\Users\kasum\Downloads\RecyclerRegistrationGrantedList.xlsx"
OUTPUT_CSV = r"C:\Users\kasum\Downloads\test_5_geocoded.csv"

# Allowed states
ALLOWED_STATES = {"TAMIL NADU", "KERALA", "KARNATAKA", "UTTAR PRADESH"} # Added UP as it was in sample

# Geocoder
geolocator = Nominatim(user_agent="elocate_test_loader")

def extract_pincode(address):
    match = re.search(r'\b\d{6}\b', str(address))
    return match.group(0) if match else None

def get_lat_lon_smart(address, state):
    pincode = extract_pincode(address)
    strategies = [
        ("PIN", f"{pincode}, {state}, India" if pincode else None),
        ("FULL_ADDRESS", f"{address}, {state}, India"),
    ]
    
    for strategy_name, search_query in strategies:
        if not search_query: continue
        try:
            print(f"    Trying {strategy_name}: {search_query[:50]}...")
            location = geolocator.geocode(search_query, timeout=10)
            time.sleep(1.5)
            if location:
                return location.latitude, location.longitude, strategy_name
        except Exception as e:
            print(f"    ⚠️  {strategy_name} failed: {e}")
    return None, None, "FAILED"

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: Input file not found: {INPUT_FILE}")
        return

    print(f"Reading first 5 rows from: {INPUT_FILE}")
    df = pd.read_excel(INPUT_FILE).head(5)
    
    target_columns = [
        'id', 'name', 'address', 'latitude', 'longitude', 
        'capacity', 'contact_number', 'operating_hours', 
        'is_verified', 'is_active', 'created_at', 'updated_at', 
        'geocode_source', 'email', 'state', 'pincode'
    ]

    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=target_columns)
        writer.writeheader()
        
        for _, row in df.iterrows():
            # Basic column search (case-insensitive)
            name = next((row[c] for c in df.columns if 'name' in c.lower()), "Unknown")
            address = next((row[c] for c in df.columns if 'address' in c.lower()), "Unknown")
            state = next((row[c] for c in df.columns if 'state' in c.lower()), "Unknown")
            
            print(f"\nProcessing: {name}")
            lat, lon, source = get_lat_lon_smart(address, state)
            
            now = datetime.utcnow().isoformat()
            new_row = {
                'id': str(uuid.uuid4()),
                'name': name,
                'address': address,
                'latitude': lat,
                'longitude': lon,
                'capacity': 1000,
                'contact_number': '',
                'operating_hours': '9AM-6PM',
                'is_verified': 'False',
                'is_active': 'True',
                'created_at': now,
                'updated_at': now,
                'geocode_source': source,
                'email': '',
                'state': str(state).upper(),
                'pincode': extract_pincode(address)
            }
            writer.writerow(new_row)
            print(f"  ✅ Result: {lat}, {lon} ({source})")

    print(f"\n✅ Test results saved to: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
