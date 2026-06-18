// charts.js - Fetches analytics data from backend and renders Chart.js visualizations
// Used exclusively on analytics.html

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  await renderMonthlyTrendChart();
  await renderCategoryPieChart();
  await renderRechargeVsBillChart();
});

// ============================================================
// Shared color palette (kept consistent with dashboard.css vars)
// ============================================================
const CHART_COLORS = {
  primary: '#4361ee',
  secondary: '#4cc9f0',
  success: '#2ec4b6',
  warning: '#f9844a',
  danger: '#e63946',
  purple: '#7209b7',
  grid: 'rgba(0,0,0,0.05)'
};

const CATEGORY_COLOR_MAP = {
  'Mobile Recharge': '#4361ee',
  'DTH Recharge': '#4cc9f0',
  'Fastag Recharge': '#7209b7',
  'Electricity Bill': '#f9844a',
  'Water Bill': '#2ec4b6',
  'Gas Bill': '#e63946',
  'Broadband Bill': '#ffb703'
};

// ============================================================
// LINE CHART - Monthly Spending Trend
// ============================================================
async function renderMonthlyTrendChart() {
  const canvas = document.getElementById('monthlyTrendChart');
  if (!canvas) return;

  const { data } = await apiRequest('/transactions/monthly-trend');

  if (!data?.success || data.data.length === 0) {
    showEmptyState(canvas, 'No transaction history yet to plot a trend.');
    return;
  }

  const labels = data.data.map((row) => formatMonthLabel(row.month));
  const values = data.data.map((row) => parseFloat(row.total));

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Monthly Spending (₹)',
        data: values,
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(67, 97, 238, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: CHART_COLORS.primary,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `₹${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.grid },
          ticks: { callback: (val) => `₹${val}` }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// ============================================================
// PIE CHART - Category-wise Spending
// ============================================================
async function renderCategoryPieChart() {
  const canvas = document.getElementById('categoryPieChart');
  if (!canvas) return;

  const { data } = await apiRequest('/transactions/category-spending');

  if (!data?.success || data.data.length === 0) {
    showEmptyState(canvas, 'No spending data yet to break down by category.');
    return;
  }

  const labels = data.data.map((row) => row.category_name);
  const values = data.data.map((row) => parseFloat(row.total));
  const colors = labels.map((label) => CATEGORY_COLOR_MAP[label] || CHART_COLORS.secondary);

  new Chart(canvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, padding: 14 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return `${ctx.label}: ₹${ctx.parsed.toFixed(2)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// ============================================================
// BAR CHART - Recharge vs Bill Payments
// ============================================================
async function renderRechargeVsBillChart() {
  const canvas = document.getElementById('rechargeVsBillChart');
  if (!canvas) return;

  const { data } = await apiRequest('/transactions/recharge-vs-bill');

  if (!data?.success || data.data.length === 0) {
    showEmptyState(canvas, 'No transactions yet to compare recharges vs bills.');
    return;
  }

  // Normalize so both bars always appear even if one type has zero transactions
  const totals = { recharge: 0, bill: 0 };
  data.data.forEach((row) => {
    totals[row.transaction_type] = parseFloat(row.total);
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Recharges', 'Bill Payments'],
      datasets: [{
        label: 'Total Amount (₹)',
        data: [totals.recharge, totals.bill],
        backgroundColor: [CHART_COLORS.primary, CHART_COLORS.warning],
        borderRadius: 8,
        maxBarThickness: 90
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'x',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `₹${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.grid },
          ticks: { callback: (val) => `₹${val}` }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// ============================================================
// Helpers
// ============================================================

// Converts "2026-06" -> "Jun 2026" for friendlier x-axis labels
function formatMonthLabel(yyyyMm) {
  const [year, month] = yyyyMm.split('-');
  const date = new Date(year, parseInt(month, 10) - 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// Replaces a canvas with a friendly empty-state message instead of a blank chart
function showEmptyState(canvas, message) {
  const wrapper = canvas.parentElement;
  const note = document.createElement('p');
  note.className = 'text-muted text-center py-4';
  note.textContent = message;
  canvas.replaceWith(note);
}