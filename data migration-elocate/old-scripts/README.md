# E-Waste Facility Data Migration

## Overview
Two-step process to import facility data from CSV to PostgreSQL database with geocoding and review.

## Files

### Configuration
- **`.env`** - Database connection URL

### Scripts
1. **`process_csv.py`** - Process CSV, geocode addresses, save for review
2. **`import_to_db.py`** - Import reviewed CSV to database
3. **`test_connection.py`** - Test database connection
4. **`check_tables.py`** - List all tables and check data

### Legacy
- **`tblFacility.py`** - Old direct import script (not recommended)
- **`dataFilter.py`** - Filter CSV by states

## Workflow

### Step 1: Process CSV and Geocode
```bash
python process_csv.py
```

**What it does:**
- Reads `C:\Users\kasum\Downloads\authorized_producers_cpcb.csv`
- Filters facilities in Tamil Nadu, Kerala, and Karnataka
- Geocodes addresses using OpenStreetMap (Nominatim)
- Saves to `C:\Users\kasum\Downloads\geocoded_facilities.csv`
- Handles different CSV column name variations

**Output CSV includes:**
- All original columns
- `latitude` - Geocoded latitude
- `longitude` - Geocoded longitude
- `geocode_status` - SUCCESS or FAILED

### Step 2: Review the Output
Open `geocoded_facilities.csv` and review:
- ✅ Check if coordinates look correct
- ✅ Verify addresses are properly geocoded
- ✅ Remove any unwanted rows
- ✅ Fix any data issues

### Step 3: Import to Database
```bash
python import_to_db.py
```

**What it does:**
- Reads `geocoded_facilities.csv`
- Checks for duplicates (by name + address)
- Inserts into `recycling_facility` table
- Skips rows with failed geocoding
- Shows detailed progress and summary

## Database Schema

**Table:** `recycling_facility`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | VARCHAR | Facility/company name |
| `address` | TEXT | Full address |
| `latitude` | NUMERIC | Latitude coordinate |
| `longitude` | NUMERIC | Longitude coordinate |
| `capacity` | INTEGER | Facility capacity (default: 1000) |
| `contact_number` | VARCHAR | Contact phone (nullable) |
| `operating_hours` | VARCHAR | Operating hours (default: "9AM-6PM") |
| `is_verified` | BOOLEAN | Verified status (default: false) |
| `is_active` | BOOLEAN | Active status (default: true) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Testing

### Test Database Connection
```bash
python test_connection.py
```

Shows:
- Connection details
- PostgreSQL version
- Table existence and record count
- Sample records

### Check All Tables
```bash
python check_tables.py
```

Lists all tables in the database and shows first record from `recycling_facility`.

## Configuration

### Database Connection (`.env`)
```env
DATABASE_URL='postgresql://user:password@host/database?sslmode=require&channel_binding=require'
```

**Current database:** `elocate`

## Error Handling

### Common Issues

**"KeyError: 'Company Name'"**
- CSV column names don't match expected names
- `process_csv.py` handles multiple column name variations

**"Geocoding failed"**
- Rate limiting from OpenStreetMap
- Script includes 1-second delay between requests
- Failed geocoding marked in output CSV

**"Already exists"**
- Duplicate check prevents re-importing same facility
- Based on exact name + address match

## Statistics

Both scripts provide detailed statistics:
- Total rows processed
- Successfully geocoded/imported
- Skipped records
- Duplicates
- Errors

## Best Practices

1. **Always review** `geocoded_facilities.csv` before importing
2. **Backup database** before running import
3. **Monitor geocoding** rate limits (1 request/second)
4. **Check duplicates** in output before importing
5. **Verify coordinates** are in correct locations

## Example Output

### process_csv.py
```
Processing: Chennai Recycling Center...
  ✅ Geocoded: 13.0827, 80.2707

==================================================
Processing Summary:
==================================================
Total rows read:          100
Filtered (wrong state):   50
Skipped (missing data):   5
Processed:                45
Successfully geocoded:    40
Failed geocoding:         5
==================================================

✅ Output saved to: C:\Users\kasum\Downloads\geocoded_facilities.csv
```

### import_to_db.py
```
✅ Inserted: Chennai Recycling Center

==================================================
Import Summary:
==================================================
Total rows read:          40
Successfully imported:    38
Skipped (no coordinates): 2
Duplicates:               0
Errors:                   0
==================================================

✅ Successfully imported 38 facilities to database!
```

## Dependencies

```bash
pip install psycopg2-binary python-dotenv geopy
```

## Support

For issues or questions, check:
1. Database connection (`.env` file)
2. CSV file path and format
3. Column names in CSV
4. Geocoding rate limits
