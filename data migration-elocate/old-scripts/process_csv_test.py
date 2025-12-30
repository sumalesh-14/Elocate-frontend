import csv
import os
import time
from geopy.geocoders import Nominatim
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# CSV paths
INPUT_CSV = r"C:\Users\kasum\Downloads\authorized_producers_cpcb.csv"
OUTPUT_CSV = r"C:\Users\kasum\Downloads\geocoded_facilities_test.csv"

# Allowed states
ALLOWED_STATES = {"TAMIL NADU", "KERALA", "KARNATAKA"}

# Geocoder (FREE – OpenStreetMap)
geolocator = Nominatim(user_agent="elocate_facility_loader")

# LIMIT FOR TESTING
MAX_TO_PROCESS = 5  # Only process first 5 matching records

def get_lat_lon(address):
    """Geocode an address to get latitude and longitude."""
    try:
        location = geolocator.geocode(address, timeout=10)
        time.sleep(1)  # IMPORTANT: avoid API rate limiting
        if location:
            return location.latitude, location.longitude
    except Exception as e:
        print(f"Geocoding failed: {e}")
    return None, None

print(f"TEST MODE: Processing only first {MAX_TO_PROCESS} matching records")
print(f"Reading from: {INPUT_CSV}")
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
if not os.path.exists(INPUT_CSV):
    print(f"❌ Error: Input file not found: {INPUT_CSV}")
    exit(1)

# Read input CSV and process
with open(INPUT_CSV, "r", encoding="utf-8", newline="") as infile:
    reader = csv.DictReader(infile)
    
    # Print available columns for debugging
    print("Available columns in CSV:")
    for col in reader.fieldnames:
        print(f"  - [{col}]")
    print()
    
    # Prepare output CSV with new columns
    output_fieldnames = list(reader.fieldnames) + ['latitude', 'longitude', 'geocode_status']
    
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=output_fieldnames)
        writer.writeheader()
        
        for row in reader:
            stats['total'] += 1
            
            # Stop if we've processed enough
            if stats['processed'] >= MAX_TO_PROCESS:
                print(f"\n✋ Reached limit of {MAX_TO_PROCESS} records, stopping...")
                break
            
            # Get state
            state = None
            for col in ['State', 'state', 'STATE']:
                if col in row and row[col]:
                    state = row[col].strip().upper()
                    break
            
            if not state:
                stats['skipped'] += 1
                continue
            
            # Filter by state
            if state not in ALLOWED_STATES:
                stats['filtered'] += 1
                continue
            
            # Get company name and address - handle BOM in column names
            name = None
            for col in ['﻿Company Name', 'Company Name', 'company_name', 'Name', 'name']:
                if col in row and row[col]:
                    name = row[col].strip()
                    break
            
            address = None
            for col in ['Address', 'address', 'ADDRESS']:
                if col in row and row[col]:
                    address = row[col].strip()
                    break
            
            if not name or not address:
                stats['skipped'] += 1
                continue
            
            # Geocode the address
            print(f"Processing {stats['processed']+1}/{MAX_TO_PROCESS}: {name[:50]}...")
            latitude, longitude = get_lat_lon(address)
            
            # Add geocoding results to row
            if latitude and longitude:
                row['latitude'] = latitude
                row['longitude'] = longitude
                row['geocode_status'] = 'SUCCESS'
                stats['geocoded'] += 1
                print(f"  ✅ Geocoded: {latitude}, {longitude}")
            else:
                row['latitude'] = ''
                row['longitude'] = ''
                row['geocode_status'] = 'FAILED'
                print(f"  ❌ Geocoding failed")
            
            # Write to output CSV
            writer.writerow(row)
            stats['processed'] += 1

# Print summary
print("\n" + "="*60)
print("TEST Processing Summary:")
print("="*60)
print(f"Total rows scanned:       {stats['total']}")
print(f"Filtered (wrong state):   {stats['filtered']}")
print(f"Skipped (missing data):   {stats['skipped']}")
print(f"Processed:                {stats['processed']}")
print(f"Successfully geocoded:    {stats['geocoded']}")
print(f"Failed geocoding:         {stats['processed'] - stats['geocoded']}")
print("="*60)

if stats['processed'] > 0:
    print(f"\n✅ Test output saved to: {OUTPUT_CSV}")
    print(f"\n📋 If this looks good, run the full 'python process_csv.py'")
else:
    print("\n⚠️  No records were processed")
