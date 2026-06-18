"""
predict.py
Called by backend/services/predictionService.js via child_process.spawn.

Usage:
    python predict.py <bill_type> '<json_history>'

Where json_history is a JSON array like:
    [{"amount": 1200.50, "transaction_date": "2026-03-15T10:00:00Z"}, ...]

Prints to stdout:
    {"predicted_amount": 1345.67}
"""

import sys
import json
import pickle
import os
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')


def load_model():
    with open(MODEL_PATH, 'rb') as f:
        return pickle.load(f)


def build_features(bill_type, history, bill_type_map):
    """
    Builds the same feature set the model was trained on:
    month_num, bill_type_encoded, previous_amount, rolling_avg_3
    using the user's real historical bill amounts from MySQL.
    """
    # Sort history chronologically (oldest -> newest) just in case
    sorted_history = sorted(history, key=lambda r: r['transaction_date'])
    amounts = [float(r['amount']) for r in sorted_history]

    previous_amount = amounts[-1]
    last_n = amounts[-3:] if len(amounts) >= 3 else amounts
    rolling_avg_3 = sum(last_n) / len(last_n)

    # Predicting for "next month" relative to today
    next_month_num = (datetime.now().month % 12) + 1
    bill_type_encoded = bill_type_map.get(bill_type, 0)

    return {
        'month_num': next_month_num,
        'bill_type_encoded': bill_type_encoded,
        'previous_amount': previous_amount,
        'rolling_avg_3': rolling_avg_3
    }


def main():
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing arguments: bill_type and history JSON required.'}))
        sys.exit(1)

    bill_type = sys.argv[1]
    history_json = sys.argv[2]

    try:
        history = json.loads(history_json)
    except json.JSONDecodeError:
        print(json.dumps({'error': 'Invalid history JSON.'}))
        sys.exit(1)

    if not history or len(history) < 1:
        print(json.dumps({'error': 'No historical data provided.'}))
        sys.exit(1)

    bundle = load_model()
    model = bundle['model']
    feature_columns = bundle['feature_columns']
    bill_type_map = bundle['bill_type_map']

    features = build_features(bill_type, history, bill_type_map)

    # Build the feature vector in the exact column order used during training
    feature_vector = [[features[col] for col in feature_columns]]

    predicted_amount = model.predict(feature_vector)[0]

    print(json.dumps({'predicted_amount': round(float(predicted_amount), 2)}))


if __name__ == '__main__':
    main()