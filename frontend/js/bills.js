// bills.js - Handles bill payment form, history, and triggers ML predictions

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  const billForm = document.getElementById('billForm');
  if (billForm) {
    billForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        billType: document.getElementById('billType').value,
        providerName: document.getElementById('providerName').value.trim(),
        consumerNumber: document.getElementById('consumerNumber').value.trim(),
        billingMonth: document.getElementById('billingMonth').value,
        dueDate: document.getElementById('dueDate').value,
        amount: parseFloat(document.getElementById('amount').value),
        paymentMethod: document.getElementById('paymentMethod').value
      };

      const { status, data } = await apiRequest('/bills/pay', 'POST', payload);

      if (status === 201 && data.success) {
        showToast(data.message, 'success');
        billForm.reset();
        loadBillHistory();
      } else {
        showToast(data.message || 'Bill payment failed.', 'danger');
      }
    });
  }

  const predictBtn = document.getElementById('predictBillBtn');
  if (predictBtn) {
    predictBtn.addEventListener('click', async () => {
      const billType = document.getElementById('predictBillType').value;
      const { status, data } = await apiRequest('/predictions/predict', 'POST', { billType });

      const resultEl = document.getElementById('predictionResult');
      if (status === 200 && data.success) {
        resultEl.innerHTML = `<div class="prediction-card">Predicted next <strong>${billType}</strong> bill: ₹${parseFloat(data.predictedAmount).toFixed(2)}</div>`;
      } else {
        resultEl.innerHTML = `<p class="text-danger small">${data.message || 'Prediction failed.'}</p>`;
      }
    });
  }

  await loadBillHistory();
});

async function loadBillHistory() {
  const { data } = await apiRequest('/bills/history');
  const container = document.getElementById('billHistoryTable');
  if (!container) return;

  if (!data?.success || data.bills.length === 0) {
    container.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No bill payments yet.</td></tr>';
    return;
  }

  container.innerHTML = data.bills.map((b) => `
    <tr>
      <td>${b.bill_type.charAt(0).toUpperCase() + b.bill_type.slice(1)}</td>
      <td>${b.provider_name}</td>
      <td>${b.consumer_number}</td>
      <td>${new Date(b.transaction_date).toLocaleDateString()}</td>
      <td><span class="badge ${b.status === 'success' ? 'badge-success-soft' : 'badge-pending-soft'}">${b.status}</span></td>
    </tr>`).join('');
}