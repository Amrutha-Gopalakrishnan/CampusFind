import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, "lost_found_150_random_items.csv")

def read_csv():
    """Read CSV file and return DataFrame"""
    if not os.path.exists(CSV_FILE):
        print("CSV file not found at:", CSV_FILE)
        return None
    df = pd.read_csv(CSV_FILE)
    return df

def get_past_analysis():
    """Return dashboard-ready analysis"""
    df = read_csv()
    if df is None:
        return {"error": "CSV file not found"}

    # Capitalize status for consistency
    df['status'] = df['status'].str.capitalize()

    analysis = {
        "total_items": len(df),
        "total_lost": len(df[df["status"] == "Lost"]),
        "total_found": len(df[df["status"] == "Found"]),
        "status_frequency": df['status'].value_counts().to_dict(),  # for Pie chart
        "trend_by_date": df.groupby('date')['status'].value_counts().unstack(fill_value=0).to_dict(orient='index')  # for Bar chart
    }

    return analysis
