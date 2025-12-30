import pandas as pd
import os
import time
import re
import uuid
from datetime import datetime
from geopy.geocoders import Nominatim
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# CSV paths
# File paths
INPUT_FILE = r"C:\Users\kasum\Downloads\RecyclerRegistrationGrantedList.xlsx"
OUTPUT_CSV = r"C:\Users\kasum\Downloads\geocoded_facilities.csv"

# Allowed states
ALLOWED_STATES = {"TAMIL NADU", "KERALA", "KARNATAKA"}

# Geocoder (FREE – OpenStreetMap)
geolocator = Nominatim(user_agent="elocate_facility_loader")

def extract_pincode(address):
    """Extract 6-digit Indian PIN code from address"""
    match = re.search(r'\b\d{6}\b', address)
    return match.group(0) if match else None

def extract_city_from_address(address):
    """Extract likely city/area name from address"""
    parts = [p.strip() for p in address.split(',')]
    if len(parts) >= 3:
        return ', '.join(parts[-3:])
    elif len(parts) >= 2:
        return ', '.join(parts[-2:])
    return address

def get_lat_lon_smart(full_address, district, state):
    """
    Smart geocoding priority for Indian addresses:
    1. Full address with PIN
    2. PIN + State
    3. Full address
    4. City/Area + State
    5. District + State
    6. State only
    """
    pincode = extract_pincode(full_address)
    city_area = extract_city_from_address(full_address)
    
    strategies = [
        ("PIN_FULL", full_address if pincode else None),
        ("PIN", f"{pincode}, {state}, India" if pincode else None),
        ("FULL_ADDRESS", full_address),
        ("AREA", f"{city_area}, {state}, India" if city_area != full_address else None)
    ]
    
    for strategy_name, address in strategies:
        if not address or address == ", India" or address == "None, India":
            continue
            
        try:
            print(f"    Trying: {strategy_name}")
            print(f"      → {address[:100]}...")
            location = geolocator.geocode(address, timeout=10)
            time.sleep(1.5)  # Delay for rate limiting
            
            if location:
                print(f"    ✅ SUCCESS with {strategy_name}")
                return location.latitude, location.longitude, strategy_name
        except Exception as e:
            print(f"    ⚠️  {strategy_name} failed: {e}")
            time.sleep(1)
    
    return None, None, "FAILED"

print(f"Reading from: {INPUT_FILE}")
print(f"Output will be saved to: {OUTPUT_CSV}")
print(f"Filtering states: {', '.join(ALLOWED_STATES)}\n")

# Statistics
stats = {
    'total': 0,
    'filtered': 0,
    'geocoded': 0,
    'skipped': 0,
    'processed': 0
}

# Check if input file exists
if not os.path.exists(INPUT_FILE):
    print(f"❌ Error: Input file not found: {INPUT_FILE}")
    exit(1)

# Target CSV Format (Matches database table)
target_columns = [
    'id', 'name', 'address', 'latitude', 'longitude', 
    'capacity', 'contact_number', 'operating_hours', 
    'is_verified', 'is_active', 'created_at', 'updated_at', 
    'geocode_source', 'email', 'state', 'pincode'
]

print(f"Reading from: {INPUT_FILE}")
print(f"Output will be saved to: {OUTPUT_CSV}")

# Read input Excel
try:
    df = pd.read_excel(INPUT_FILE)
    print(f"Successfully loaded {len(df)} rows from Excel.\n")
except Exception as e:
    print(f"❌ Error reading Excel file: {e}")
    exit(1)

# Mapping logic for Excel columns
# (Looking for keywords in case column names vary)
def find_col(possible_names, df_columns):
    for name in possible_names:
        for col in df_columns:
            if name.lower() in col.lower():
                return col
    return None

name_col = find_col(['Company Name', 'Name', 'Unit Name'], df.columns)
address_col = find_col(['Address'], df.columns)
state_col = find_col(['State'], df.columns)
district_col = find_col(['District'], df.columns)
email_col = find_col(['Email'], df.columns)

import csv # Needed for writing OUTPUT_CSV

with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as outfile:
    writer = csv.DictWriter(outfile, fieldnames=target_columns)
    writer.writeheader()
    
    for _, row in df.iterrows():
        stats['total'] += 1
        
        # Get data using mapped columns
        current_state = str(row[state_col]).strip().upper() if state_col and pd.notna(row[state_col]) else None
        
        if not current_state:
            stats['skipped'] += 1
            continue
        
        # Filter by state
        if current_state not in ALLOWED_STATES:
            stats['filtered'] += 1
            continue
        
        name = str(row[name_col]).strip() if name_col and pd.notna(row[name_col]) else None
        address = str(row[address_col]).strip() if address_col and pd.notna(row[address_col]) else None
        email = str(row[email_col]).strip() if email_col and pd.notna(row[email_col]) else ''
        district = str(row[district_col]).strip() if district_col and pd.notna(row[district_col]) else ''
        
        if not name or not address:
            stats['skipped'] += 1
            continue
            
        pincode = extract_pincode(address)
        
        # Geocode the address
        print(f"Processing: {name[:50]}...")
        latitude, longitude, source = get_lat_lon_smart(address, district, current_state)
        
        # Prepare row for standardized CSV
        now = datetime.utcnow().isoformat()
        
        new_row = {
            'id': str(uuid.uuid4()),
            'name': name,
            'address': address,
            'latitude': latitude if latitude else '',
            'longitude': longitude if longitude else '',
            'capacity': 1000,
            'contact_number': '',
            'operating_hours': '9AM-6PM',
            'is_verified': 'False',
            'is_active': 'True',
            'created_at': now,
            'updated_at': now,
            'geocode_source': source,
            'email': email,
            'state': current_state,
            'pincode': pincode if pincode else ''
        }
        
        if latitude and longitude:
            stats['geocoded'] += 1
            print(f"  ✅ Geocoded ({source}): {latitude}, {longitude}")
        else:
            print(f"  ❌ Geocoding failed")
        
        # Write to output CSV
        writer.writerow(new_row)
        stats['processed'] += 1

# Print summary
print("\n" + "="*60)
print("Processing Summary:")
print("="*60)
print(f"Total rows read:          {stats['total']}")
print(f"Filtered (wrong state):   {stats['filtered']}")
print(f"Skipped (missing data):   {stats['skipped']}")
print(f"Processed:                {stats['processed']}")
print(f"Successfully geocoded:    {stats['geocoded']}")
print(f"Failed geocoding:         {stats['processed'] - stats['geocoded']}")
print("="*60)

if stats['processed'] > 0:
    print(f"\n✅ Output saved to: {OUTPUT_CSV}")
else:
    print("\n⚠️  No records were processed")
