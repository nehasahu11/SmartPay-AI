// auth.js - Handles login, signup, and forgot/reset password forms

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotForm');
  const resetForm = document.getElementById('resetForm');

  // ---------- Login ----------
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const { status, data } = await apiRequest('/auth/login', 'POST', { email, password }, false);

      if (status === 200 && data.success) {
        setToken(data.token);
        localStorage.setItem('smartpay_user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
      } else {
        showToast(data.message || 'Login failed.', 'danger');
      }
    });
  }

  // ---------- Signup ----------
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phoneNumber = document.getElementById('phoneNumber').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'danger');
        return;
      }

      const { status, data } = await apiRequest(
        '/auth/register', 'POST',
        { fullName, email, password, phoneNumber }, false
      );

      if (status === 201 && data.success) {
        showToast('Account created! Please log in.', 'success');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      } else {
        showToast(data.message || 'Registration failed.', 'danger');
      }
    });
  }

  // ---------- Forgot Password ----------
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();

      const { status, data } = await apiRequest('/auth/forgot-password', 'POST', { email }, false);

      if (status === 200 && data.success) {
        showToast('Reset token generated. Check the field below.', 'success');
        document.getElementById('resetTokenDisplay').value = data.resetToken;
        document.getElementById('resetSection').classList.remove('d-none');
      } else {
        showToast(data.message || 'Could not generate reset token.', 'danger');
      }
    });
  }

  // ---------- Reset Password ----------
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('resetTokenDisplay').value.trim();
      const newPassword = document.getElementById('newPassword').value;

      const { status, data } = await apiRequest('/auth/reset-password', 'POST', { token, newPassword }, false);

      if (status === 200 && data.success) {
        showToast('Password reset! Redirecting to login...', 'success');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      } else {
        showToast(data.message || 'Reset failed.', 'danger');
      }
    });
  }

  // ---------- Logout (used on dashboard pages) ----------
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      await apiRequest('/auth/logout', 'POST', null, true);
      clearSession();
      window.location.href = 'login.html';
    });
  });
});