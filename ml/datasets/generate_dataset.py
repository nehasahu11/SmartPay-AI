"""
generate_dataset.py
Generates a synthetic historical bill dataset for model training.
Run once: python generate_dataset.py
Produces: ml/datasets/bill_history.csv
"""

import pandas as pd
import numpy as np
import random
from datetime import date

random.seed(42)
np.random.seed(42)

BILL_TYPES = ['electricity', 'water', 'gas', 'broadband']
NUM_USERS = 60
MONTHS = pd.date_range(start='2024-01-01', end='2025-12-01', freq='MS')  # 24 months

# Base average amount per bill type (₹), and seasonal amplitude
BASE_AMOUNT = {
    'electricity': 1400,
    'water': 350,
    'gas': 600,
    'broadband': 800
}

SEASONAL_AMPLITUDE = {
    'electricity': 500,   # summer AC usage spikes
    'water': 80,
    'gas': 150,            # winter heating spikes
    'broadband': 30        # broadband is mostly flat
}

def seasonal_factor(bill_type, month):
    """Returns a multiplier based on month to simulate seasonal usage patterns."""
    if bill_type == 'electricity':
        # Peaks in summer months (Apr-Jul)
        return 1 + 0.4 * np.sin((month - 4) * np.pi / 6) if 1 <= month <= 12 else 1
    if bill_type == 'gas':
        # Peaks in winter months (Nov-Feb)
        return 1 + 0.35 * np.cos((month - 1) * np.pi / 6)
    if bill_type == 'water':
        return 1 + 0.15 * np.sin((month - 5) * np.pi / 6)
    return 1.0  # broadband stays flat

rows = []
for user_id in range(1, NUM_USERS + 1):
    for bill_type in BILL_TYPES:
        base = BASE_AMOUNT[bill_type]
        amplitude = SEASONAL_AMPLITUDE[bill_type]
        # Each user has a personal usage tendency (some always pay more/less)
        user_factor = np.random.uniform(0.8, 1.3)

        for m in MONTHS:
            month_num = m.month
            factor = seasonal_factor(bill_type, month_num)
            noise = np.random.normal(0, amplitude * 0.15)
            amount = max(50, base * user_factor * factor + amplitude * (factor - 1) + noise)

            rows.append({
                'user_id': user_id,
                'bill_type': bill_type,
                'billing_month': m.strftime('%Y-%m'),
                'amount': round(amount, 2)
            })

df = pd.DataFrame(rows)

# Inject a small amount of missing/erroneous data to simulate real-world messiness
# (this gives the data-cleaning step in train_model.py something real to do)
drop_indices = df.sample(frac=0.01, random_state=42).index
df.loc[drop_indices, 'amount'] = np.nan

negative_indices = df.sample(frac=0.005, random_state=7).index
df.loc[negative_indices, 'amount'] = -1  # simulate a data-entry error

df.to_csv('bill_history.csv', index=False)
print(f"Generated {len(df)} rows -> bill_history.csv")