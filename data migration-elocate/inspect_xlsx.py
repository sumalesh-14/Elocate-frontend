import pandas as pd
import os

FILE_PATH = r"C:\Users\kasum\Downloads\RecyclerRegistrationGrantedList.xlsx"

def inspect_excel():
    if not os.path.exists(FILE_PATH):
        print(f"❌ Error: File not found at {FILE_PATH}")
        return

    try:
        print(f"Reading: {FILE_PATH}...")
        df = pd.read_excel(FILE_PATH)
        
        print("\nColumn names in Excel:")
        print("="*60)
        for idx, col in enumerate(df.columns, 1):
            print(f"{idx:2}. [{col}]")
        
        print("\n" + "="*60)
        print("Sample data from first row:")
        print("="*60)
        
        if not df.empty:
            first_row = df.iloc[0]
            for col in df.columns[:15]:  # Show first 15 columns
                value = first_row.get(col, '')
                print(f"{col}: [{value}]")
            
            print("\nTotal Rows:", len(df))
        else:
            print("File is empty.")

    except Exception as e:
        print(f"Error reading Excel file: {e}")

if __name__ == "__main__":
    inspect_excel()
