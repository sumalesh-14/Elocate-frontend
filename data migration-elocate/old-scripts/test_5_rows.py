import csv
import os
import time
import re
import uuid
import datetime
from geopy.geocoders import Nominatim
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# CSV paths
INPUT_CSV = r"C:\Users\kasum\Downloads\authorized_producers_cpcb.csv"
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
OUTPUT_CSV = rf"C:\Users\kasum\Downloads\data migration-elocate\geocoded_test_{timestamp}.csv"

# Allowed states
ALLOWED_STATES = {"TAMIL NADU", "KERALA", "KARNATAKA"}

# Geocoder (FREE – OpenStreetMap)
geolocator = Nominatim(user_agent="elocate_facility_loader")

# LIMIT FOR TESTING
MAX_TO_PROCESS = 5

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
            time.sleep(1.5)
            
            if location:
                print(f"    ✅ SUCCESS with {strategy_name}")
                return location.latitude, location.longitude, strategy_name
        except Exception as e:
            print(f"    ⚠️  {strategy_name} failed: {e}")
            time.sleep(1)
    
    return None, None, "FAILED"

print(f"TEST MODE: Processing first {MAX_TO_PROCESS} records")

# Target CSV Format (Matches database table)
target_columns = [
    'id', 'name', 'address', 'latitude', 'longitude', 
    'capacity', 'contact_number', 'operating_hours', 
    'is_verified', 'is_active', 'created_at', 'updated_at', 
    'geocode_source', 'email', 'state', 'pincode'
]

# Statistics
stats = {'total': 0, 'processed': 0, 'geocoded': 0}

with open(INPUT_CSV, "r", encoding="utf-8", newline="") as infile:
    reader = csv.DictReader(infile)
    
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=target_columns)
        writer.writeheader()
        
        for row in reader:
            if stats['processed'] >= MAX_TO_PROCESS:
                break
                
            current_state = None
            for col in ['State', 'state', 'STATE']:
                if col in row and row[col]:
                    current_state = row[col].strip().upper()
                    break
            
            if not current_state or current_state not in ALLOWED_STATES:
                continue
            
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
                continue
                
            district = row.get('District', '').strip()
            email = row.get('Email', '').strip()
            pincode = extract_pincode(address)
            
            print(f"Processing: {name[:50]}...")
            lat, lon, source = get_lat_lon_smart(address, district, current_state)
            
            now = datetime.datetime.utcnow().isoformat()
            new_row = {
                'id': str(uuid.uuid4()),
                'name': name,
                'address': address,
                'latitude': lat if lat else '',
                'longitude': lon if lon else '',
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
            
            writer.writerow(new_row)
            stats['processed'] += 1
            if lat: stats['geocoded'] += 1

print(f"\n✅ Test output saved to: {OUTPUT_CSV}")
