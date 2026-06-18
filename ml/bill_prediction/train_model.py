"""
train_model.py
Trains a Random Forest Regressor to predict next-month bill amounts.
Run once (or whenever you want to retrain): python train_model.py
Produces: model.pkl
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATASET_PATH = os.path.join('..', 'datasets', 'bill_history.csv')
MODEL_OUTPUT_PATH = 'model.pkl'

# Encoding map for bill_type -> numeric feature (kept simple and explicit
# rather than using LabelEncoder, so predict.py can use the exact same mapping
# without needing to load a separate encoder object)
BILL_TYPE_MAP = {'electricity': 0, 'water': 1, 'gas': 2, 'broadband': 3}


# ============================================================
# STEP 1: Load Data
# ============================================================
def load_data():
    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df)} raw rows.")
    return df


# ============================================================
# STEP 2: Data Cleaning
# ============================================================
def clean_data(df):
    initial_count = len(df)

    # Drop rows with missing amounts
    df = df.dropna(subset=['amount'])

    # Remove invalid/negative amounts (data-entry errors)
    df = df[df['amount'] > 0]

    # Remove statistical outliers per bill_type using the IQR method,
    # so one freak reading doesn't distort the model's understanding of "normal"
    cleaned_frames = []
    for bill_type, group in df.groupby('bill_type'):
        q1 = group['amount'].quantile(0.25)
        q3 = group['amount'].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        filtered = group[(group['amount'] >= lower_bound) & (group['amount'] <= upper_bound)]
        cleaned_frames.append(filtered)

    df = pd.concat(cleaned_frames, ignore_index=True)

    print(f"Cleaned data: {initial_count} -> {len(df)} rows "
          f"({initial_count - len(df)} rows removed as missing/invalid/outliers).")
    return df


# ============================================================
# STEP 3: Data Preprocessing & Feature Engineering
# ============================================================
def preprocess(df):
    df = df.copy()
    df['billing_month'] = pd.to_datetime(df['billing_month'], format='%Y-%m')
    df['month_num'] = df['billing_month'].dt.month
    df['bill_type_encoded'] = df['bill_type'].map(BILL_TYPE_MAP)

    # Sort so lag/rolling features are calculated in correct chronological order
    df = df.sort_values(['user_id', 'bill_type', 'billing_month'])

    # Lag feature: previous month's amount for the same user + bill type
    df['previous_amount'] = df.groupby(['user_id', 'bill_type'])['amount'].shift(1)

    # Rolling average of the last 3 bills (smooths out noise, captures trend)
    df['rolling_avg_3'] = (
        df.groupby(['user_id', 'bill_type'])['amount']
          .rolling(window=3, min_periods=1)
          .mean()
          .reset_index(level=[0, 1], drop=True)
    )

    # Drop rows where we don't yet have a previous_amount (first record per user/bill_type)
    df = df.dropna(subset=['previous_amount'])

    print(f"After feature engineering: {len(df)} rows ready for training.")
    return df


# ============================================================
# STEP 4: Model Training
# ============================================================
def train_model(df):
    feature_columns = ['month_num', 'bill_type_encoded', 'previous_amount', 'rolling_avg_3']
    X = df[feature_columns]
    y = df['amount']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # ---------- Evaluation ----------
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print("\n--- Model Evaluation ---")
    print(f"MAE  (Mean Absolute Error): ₹{mae:.2f}")
    print(f"RMSE (Root Mean Squared Error): ₹{rmse:.2f}")
    print(f"R² Score: {r2:.4f}")

    return model, feature_columns


# ============================================================
# STEP 5: Save Model
# ============================================================
def save_model(model, feature_columns):
    bundle = {
        'model': model,
        'feature_columns': feature_columns,
        'bill_type_map': BILL_TYPE_MAP,
        'version': 'v1.0'
    }
    with open(MODEL_OUTPUT_PATH, 'wb') as f:
        pickle.dump(bundle, f)
    print(f"\nModel saved to {MODEL_OUTPUT_PATH}")


if __name__ == '__main__':
    raw_df = load_data()
    cleaned_df = clean_data(raw_df)
    processed_df = preprocess(cleaned_df)
    trained_model, feature_columns = train_model(processed_df)
    save_model(trained_model, feature_columns)