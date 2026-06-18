"""
run_insights.py
Entry point invoked by backend/services (child_process.spawn) from Node.js.

Usage:
    python run_insights.py '<json_transactions>'
"""

import sys
import json

from analyze_spending import (
    load_transactions,
    categorize_spending,
    monthly_breakdown,
    detect_patterns,
    get_summary_stats
)
from recommendations import generate_recommendations


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Missing transactions JSON argument.'}))
        sys.exit(1)

    try:
        transactions = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        print(json.dumps({'error': 'Invalid transactions JSON.'}))
        sys.exit(1)

    df = load_transactions(transactions)

    summary_stats = get_summary_stats(df)
    category_data = categorize_spending(df)
    monthly_data = monthly_breakdown(df)
    patterns = detect_patterns(df)
    recommendations = generate_recommendations(category_data, patterns, summary_stats)

    output = {
        'summary': summary_stats,
        'category_breakdown': category_data,
        'monthly_breakdown': monthly_data,
        'patterns': patterns,
        'recommendations': recommendations
    }

    print(json.dumps(output))


if __name__ == '__main__':
    main()