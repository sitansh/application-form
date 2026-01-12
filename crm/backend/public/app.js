const $ = (sel) => document.querySelector(sel);
// simple client-side guard: redirect to login if not authenticated
try {
  const token = localStorage.getItem('crm_token');
  if (!token) {
    window.location.href = '/login.html';
  }
} catch (e) {}

// helper to include token in fetch calls
function authHeaders() {
  try {
    const token = localStorage.getItem('crm_token');
    if (token) return { 'Authorization': 'Bearer ' + token };
  } catch (e) {}
  return {};
}
const tbody = $('#apps-table tbody');
const msg = $('#message');

async function fetchApps() {
  msg.textContent = 'Loading...';
  tbody.innerHTML = '';
  const search = encodeURIComponent($('#search').value.trim());
  const status = encodeURIComponent($('#status').value);
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  params.set('limit', '100');

  try {
    const res = await fetch('/api/applications?' + params.toString(), { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.message || 'failed');

    const apps = payload.data || [];
    if (apps.length === 0) {
      msg.textContent = 'No applications found.';
      return;
    }
    msg.textContent = `Showing ${apps.length} applications`;

    for (const a of apps) {
      const tr = document.createElement('tr');
      const submitted = a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '';
      tr.innerHTML = `
        <td>${a.applicationId || a._id}</td>
        <td>${(a.firstName||'') + ' ' + (a.lastName||'')}</td>
        <td>${a.email||''}</td>
        <td>${a.status||''}</td>
        <td>${submitted}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    msg.textContent = 'Error loading applications: ' + err.message;
  }
}

// load current user and show in header
async function loadUser() {
  try {
    const res = await fetch('/api/auth/me', { headers: { ...authHeaders() } });
    const payload = await res.json();
    const label = document.getElementById('userLabel');
    if (payload && payload.success && payload.authenticated && payload.user) {
      label.textContent = `Signed in as ${payload.user.username}`;
    } else {
      label.textContent = 'Not signed in';
    }
  } catch (err) {
    const label = document.getElementById('userLabel');
    if (label) label.textContent = 'Not signed in';
  }
}

// initial load
loadUser();

$('#refresh').addEventListener('click', fetchApps);
$('#search').addEventListener('keyup', (e) => { if (e.key === 'Enter') fetchApps(); });
$('#status').addEventListener('change', fetchApps);

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      logoutBtn.disabled = true;
      const res = await fetch('/api/auth/logout', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
      // clear token locally regardless of server response
      try { localStorage.removeItem('crm_token'); } catch (e) {}
      window.location.href = '/login.html';
    } catch (err) {
      try { localStorage.removeItem('crm_token'); } catch (e) {}
      window.location.href = '/login.html';
    }
  });
}

// initial load
fetchApps();
