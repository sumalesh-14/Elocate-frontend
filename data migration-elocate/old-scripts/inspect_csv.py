import pandas as pd

FILE_PATH = r"C:\Users\kasum\Downloads\RecyclerRegistrationGrantedList.xlsx"

try:
    df = pd.read_excel(FILE_PATH)
    
    print("Column names in Excel:")
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
    else:
        print("File is empty.")

except Exception as e:
    print(f"Error reading Excel file: {e}")
