const $ = (sel) => document.querySelector(sel);
const loginBtn = $('#loginBtn');
const cancelBtn = $('#cancelBtn');
const msg = $('#loginMsg');

function setToken(token) {
  try { localStorage.setItem('crm_token', token); } catch (e) {}
}

loginBtn.addEventListener('click', async () => {
  msg.textContent = '';
  const username = $('#username').value.trim();
  const password = $('#password').value;
  if (!username || !password) { msg.textContent = 'Enter username and password'; return; }
  loginBtn.disabled = true;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      msg.textContent = payload.message || 'Login failed';
      loginBtn.disabled = false;
      return;
    }
    setToken(payload.token);
    // redirect to CRM app
    window.location.href = '/crm';
  } catch (err) {
    msg.textContent = 'Login error: ' + err.message;
    loginBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', () => {
  $('#username').value = '';
  $('#password').value = '';
  msg.textContent = '';
});
