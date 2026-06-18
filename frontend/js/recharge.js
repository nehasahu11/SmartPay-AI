// recharge.js - Handles recharge form submission and history rendering

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  const rechargeForm = document.getElementById('rechargeForm');
  if (rechargeForm) {
    rechargeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        rechargeType: document.getElementById('rechargeType').value,
        operatorName: document.getElementById('operatorName').value.trim(),
        accountNumber: document.getElementById('accountNumber').value.trim(),
        planDetails: document.getElementById('planDetails').value.trim(),
        amount: parseFloat(document.getElementById('amount').value),
        paymentMethod: document.getElementById('paymentMethod').value
      };

      const { status, data } = await apiRequest('/recharge', 'POST', payload);

      if (status === 201 && data.success) {
        showToast(data.message, 'success');
        rechargeForm.reset();
        loadRechargeHistory();
      } else {
        showToast(data.message || 'Recharge failed.', 'danger');
      }
    });
  }

  await loadRechargeHistory();
});

async function loadRechargeHistory() {
  const { data } = await apiRequest('/recharge/history');
  const container = document.getElementById('rechargeHistoryTable');
  if (!container) return;

  if (!data?.success || data.recharges.length === 0) {
    container.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No recharges yet.</td></tr>';
    return;
  }

  container.innerHTML = data.recharges.map((r) => `
    <tr>
      <td>${r.recharge_type.toUpperCase()}</td>
      <td>${r.operator_name}</td>
      <td>${r.account_number}</td>
      <td>${new Date(r.transaction_date).toLocaleDateString()}</td>
      <td><span class="badge ${r.status === 'success' ? 'badge-success-soft' : 'badge-pending-soft'}">${r.status}</span></td>
    </tr>`).join('');
}