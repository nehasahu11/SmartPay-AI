"""
analyze_spending.py
Analyzes a user's transaction history using Pandas:
- Categorizes spending by type
- Computes monthly/category aggregates
- Detects spending patterns (spikes, frequency, dominant categories)

Designed to be imported by run_insights.py, not run standalone.
"""

import pandas as pd
import numpy as np


def load_transactions(transactions_json):
    """
    Converts the JSON transaction list (passed from Node/MySQL) into a DataFrame.
    Expected fields per transaction: amount, category_name, transaction_type,
    transaction_date, status
    """
    df = pd.DataFrame(transactions_json)

    if df.empty:
        return df

    df['amount'] = df['amount'].astype(float)
    df['transaction_date'] = pd.to_datetime(df['transaction_date'])
    df = df[df['status'] == 'success']  # only count completed payments
    df['month'] = df['transaction_date'].dt.to_period('M').astype(str)

    return df


def categorize_spending(df):
    """
    Groups total spending by category. Returns a list of dicts:
    [{category_name, total, percentage}, ...]
    """
    if df.empty:
        return []

    category_totals = df.groupby('category_name')['amount'].sum().sort_values(ascending=False)
    grand_total = category_totals.sum()

    result = []
    for category, total in category_totals.items():
        result.append({
            'category_name': category,
            'total': round(float(total), 2),
            'percentage': round(float(total / grand_total * 100), 1)
        })
    return result


def monthly_breakdown(df):
    """Returns total spending per month, chronologically ordered."""
    if df.empty:
        return []

    monthly = df.groupby('month')['amount'].sum().sort_index()
    return [{'month': m, 'total': round(float(t), 2)} for m, t in monthly.items()]


def detect_patterns(df):
    """
    Detects notable spending patterns:
    - Dominant category (where most money goes)
    - Most frequent category (most transactions, regardless of amount)
    - Month-over-month spending change
    - Recharge vs Bill ratio
    """
    if df.empty or len(df) < 2:
        return {
            'dominant_category': None,
            'most_frequent_category': None,
            'spending_trend': 'insufficient_data',
            'trend_percentage': 0,
            'recharge_bill_ratio': None
        }

    # Dominant category by total amount
    category_totals = df.groupby('category_name')['amount'].sum()
    dominant_category = category_totals.idxmax()

    # Most frequent category by transaction count
    category_counts = df.groupby('category_name').size()
    most_frequent_category = category_counts.idxmax()

    # Month-over-month trend (compares last two months with data)
    monthly = df.groupby('month')['amount'].sum().sort_index()
    spending_trend = 'insufficient_data'
    trend_percentage = 0

    if len(monthly) >= 2:
        last_month_total = monthly.iloc[-1]
        prev_month_total = monthly.iloc[-2]
        if prev_month_total > 0:
            trend_percentage = round(((last_month_total - prev_month_total) / prev_month_total) * 100, 1)
            spending_trend = 'increasing' if trend_percentage > 5 else (
                'decreasing' if trend_percentage < -5 else 'stable'
            )

    # Recharge vs Bill ratio
    type_totals = df.groupby('transaction_type')['amount'].sum()
    recharge_total = type_totals.get('recharge', 0)
    bill_total = type_totals.get('bill', 0)
    total_all = recharge_total + bill_total
    recharge_bill_ratio = {
        'recharge_percentage': round(float(recharge_total / total_all * 100), 1) if total_all > 0 else 0,
        'bill_percentage': round(float(bill_total / total_all * 100), 1) if total_all > 0 else 0
    }

    return {
        'dominant_category': dominant_category,
        'most_frequent_category': most_frequent_category,
        'spending_trend': spending_trend,
        'trend_percentage': trend_percentage,
        'recharge_bill_ratio': recharge_bill_ratio
    }


def get_summary_stats(df):
    """Basic descriptive stats used across the dashboard and recommendations."""
    if df.empty:
        return {'total_spent': 0, 'avg_transaction': 0, 'transaction_count': 0}

    return {
        'total_spent': round(float(df['amount'].sum()), 2),
        'avg_transaction': round(float(df['amount'].mean()), 2),
        'transaction_count': int(len(df))
    }