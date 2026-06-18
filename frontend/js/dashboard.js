// dashboard.js - Populates dashboard widgets (stats, recent transactions, upcoming bills, predictions, insights)

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  const user = getCurrentUser();
  const greetingEl = document.getElementById('userGreeting');
  if (greetingEl && user) {
    greetingEl.textContent = `Welcome back, ${user.full_name.split(' ')[0]}!`;
  }

  await loadTotalSpending();
  await loadRecentTransactions();
  await loadUpcomingBills();
  await loadPredictions();
  await loadSpendingInsights();
});

async function loadTotalSpending() {
  const { data } = await apiRequest('/transactions/total-spending');
  const el = document.getElementById('totalSpendingValue');
  if (el && data?.success) {
    el.textContent = `₹${parseFloat(data.totalSpending).toFixed(2)}`;
  }
}

async function loadRecentTransactions() {
  const { data } = await apiRequest('/transactions/recent');
  const container = document.getElementById('recentTransactionsList');
  if (!container) return;

  if (!data?.success || data.transactions.length === 0) {
    container.innerHTML = '<p class="text-muted">No transactions yet.</p>';
    return;
  }

  container.innerHTML = data.transactions.map((t) => {
    const badgeClass = t.status === 'success' ? 'badge-success-soft'
      : t.status === 'pending' ? 'badge-pending-soft' : 'badge-failed-soft';
    const date = new Date(t.transaction_date).toLocaleDateString();

    return `
      <div class="transaction-list-item">
        <div>
          <strong>${t.category_name}</strong>
          <div class="text-muted small">${date}</div>
        </div>
        <div class="text-end">
          <div>₹${parseFloat(t.amount).toFixed(2)}</div>
          <span class="badge ${badgeClass}">${t.status}</span>
        </div>
      </div>`;
  }).join('');
}

async function loadUpcomingBills() {
  const { data } = await apiRequest('/bills/upcoming');
  const container = document.getElementById('upcomingBillsList');
  if (!container) return;

  if (!data?.success || data.upcoming.length === 0) {
    container.innerHTML = '<p class="text-muted">No upcoming bills.</p>';
    return;
  }

  container.innerHTML = data.upcoming.map((b) => `
    <div class="transaction-list-item">
      <div>
        <strong>${b.bill_type.charAt(0).toUpperCase() + b.bill_type.slice(1)}</strong>
        <div class="text-muted small">${b.provider_name}</div>
      </div>
      <div class="text-end small text-danger">
        Due ${new Date(b.due_date).toLocaleDateString()}
      </div>
    </div>`).join('');
}

async function loadPredictions() {
  const { data } = await apiRequest('/predictions');
  const container = document.getElementById('predictionsList');
  if (!container) return;

  if (!data?.success || data.predictions.length === 0) {
    container.innerHTML = '<p class="text-muted">No predictions yet. Visit the Bills page to generate one.</p>';
    return;
  }

  container.innerHTML = data.predictions.slice(0, 4).map((p) => `
    <div class="prediction-card">
      <strong>${p.bill_type.charAt(0).toUpperCase() + p.bill_type.slice(1)}</strong> —
      Predicted ₹${parseFloat(p.predicted_amount).toFixed(2)} for ${p.prediction_month}
    </div>`).join('');
}

async function loadSpendingInsights() {
  const { data } = await apiRequest('/transactions/insights');
  const container = document.getElementById('insightsList');
  if (!container) return;

  if (!data?.success || !data.insights.recommendations) {
    container.innerHTML = '<p class="text-muted">Not enough data yet for insights.</p>';
    return;
  }

  container.innerHTML = data.insights.recommendations.map((r) => `
    <div class="prediction-card">${r}</div>
  `).join('');
}