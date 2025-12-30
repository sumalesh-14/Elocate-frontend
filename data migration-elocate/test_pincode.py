import pandas as pd
import re
import os

# File paths
INPUT_FILE = r"C:\Users\kasum\Downloads\RecyclerRegistrationGrantedList.xlsx"

def extract_pincode(address):
    """Extracts a 6-digit pincode from the address string."""
    if pd.isna(address):
        return None
    match = re.search(r'\b\d{6}\b', str(address))
    return match.group(0) if match else None

def test_pincodes():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: Input file not found: {INPUT_FILE}")
        return

    try:
        print(f"🔍 Reading file: {INPUT_FILE}...")
        df = pd.read_excel(INPUT_FILE)
        
        # Identify the address column (case-insensitive search)
        address_col = next((c for c in df.columns if 'address' in c.lower()), None)
        
        if not address_col:
            print("❌ Error: Could not find an 'address' column in the Excel file.")
            print(f"Columns found: {list(df.columns)}")
            return

        print(f"✅ Found address column: '{address_col}'")
        print(f"🚀 Checking {len(df)} rows for pincodes...\n")

        missing_count = 0
        results = []

        for index, row in df.iterrows():
            address = row[address_col]
            pincode = extract_pincode(address)
            
            if not pincode:
                missing_count += 1
                row_num = index + 2  # Excel row number (1-indexed + header)
                # Try to get a name or ID for context
                name = next((row[c] for c in df.columns if 'name' in c.lower()), "N/A")
                results.append({
                    'Row': row_num,
                    'Name': name,
                    'Address': address
                })
                print(f"⚠️ Missing Pincode: Row {row_num} | Name: {name}")

        print("\n" + "="*60)
        print("VERIFICATION SUMMARY")
        print("="*60)
        print(f"Total Rows Checked: {len(df)}")
        print(f"Rows with Pincode:  {len(df) - missing_count}")
        print(f"Rows missing Pincode: {missing_count}")
        print("="*60)

        if missing_count > 0:
            print(f"\n❌ Verification Failed: {missing_count} addresses are missing a 6-digit pincode.")
        else:
            print("\n✅ Verification Passed: All addresses have a valid pincode.")

    except Exception as e:
        print(f"❌ Error during verification: {e}")

if __name__ == "__main__":
    test_pincodes()
