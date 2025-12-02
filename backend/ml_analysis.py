import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, "lost_found_300_items.csv")  # Your generated dataset

def read_ml_dataset():
    """Read ML dataset CSV and return DataFrame"""
    if not os.path.exists(CSV_FILE):
        print("ML CSV file not found:", CSV_FILE)
        return None
    return pd.read_csv(CSV_FILE)

def get_ml_analysis():
    """Return analytics only for ML dashboard / Predict.jsx"""
    df = read_ml_dataset()
    if df is None:
        return {"error": "ML dataset not found"}

    analysis = {
        "category_frequency": df['item_category'].value_counts().to_dict(),
        "location_frequency": df['location'].value_counts().to_dict(),
        "hour_distribution": df['lost_hour'].value_counts().sort_index().to_dict(),
        "weekday_distribution": df['day_of_week'].value_counts().to_dict(),
        "value_frequency": df['item_value'].value_counts().to_dict(),
        "total_items": len(df),
    }

    return analysis
