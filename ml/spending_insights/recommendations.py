"""
recommendations.py
Rule-based recommendation engine that turns the output of analyze_spending.py
into plain-English, actionable insights for the dashboard.
"""

def generate_recommendations(category_data, patterns, summary_stats):
    """
    Takes the structured outputs from analyze_spending.py and produces
    a list of human-readable recommendation strings.
    """
    recommendations = []

    if summary_stats['transaction_count'] == 0:
        return ["No transaction history yet. Start recharging or paying bills to receive personalized insights."]

    # ---------- Dominant category insight ----------
    if category_data:
        top = category_data[0]
        if top['percentage'] > 40:
            recommendations.append(
                f"{top['category_name']} accounts for {top['percentage']}% of your total spending — "
                f"your single largest expense category."
            )

    # ---------- Frequency-based insight ----------
    if patterns.get('most_frequent_category') and patterns.get('dominant_category'):
        if patterns['most_frequent_category'] != patterns['dominant_category']:
            recommendations.append(
                f"You transact most frequently in {patterns['most_frequent_category']}, "
                f"though it isn't your highest spending category — frequent small payments can add up."
            )

    # ---------- Trend-based insight ----------
    trend = patterns.get('spending_trend')
    trend_pct = patterns.get('trend_percentage', 0)

    if trend == 'increasing':
        recommendations.append(
            f"Your spending increased by {abs(trend_pct)}% compared to last month. "
            f"Worth reviewing recent recharges and bills."
        )
    elif trend == 'decreasing':
        recommendations.append(
            f"Good progress — your spending dropped by {abs(trend_pct)}% compared to last month."
        )
    elif trend == 'stable':
        recommendations.append("Your monthly spending has been stable — no major fluctuations recently.")

    # ---------- Recharge vs Bill balance insight ----------
    ratio = patterns.get('recharge_bill_ratio')
    if ratio:
        if ratio['recharge_percentage'] > 70:
            recommendations.append(
                f"Recharges make up {ratio['recharge_percentage']}% of your spending — "
                f"consider checking if a longer-validity plan would reduce per-recharge costs."
            )
        elif ratio['bill_percentage'] > 70:
            recommendations.append(
                f"Bill payments make up {ratio['bill_percentage']}% of your spending — "
                f"fairly typical for utility-heavy households."
            )

    # ---------- Category-specific nudges ----------
    category_lookup = {c['category_name']: c for c in category_data}

    if 'Broadband Bill' in category_lookup and category_lookup['Broadband Bill']['percentage'] > 25:
        recommendations.append(
            "Frequent or high broadband payments detected — check if your ISP offers a better-value plan."
        )

    if 'Mobile Recharge' in category_lookup and category_lookup['Mobile Recharge']['percentage'] > 30:
        recommendations.append(
            "High spending on mobile recharge — a longer validity or family plan could reduce overall cost."
        )

    # ---------- Fallback ----------
    if not recommendations:
        recommendations.append("Your spending looks balanced across categories. Keep tracking to spot trends early.")

    return recommendations