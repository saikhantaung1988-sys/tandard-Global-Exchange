/* assets/js/admin.js
   Step 1: Balance Control only
   Requires: window.db from core.js
*/

const PROFILE_TABLE = 'profiles';

function ensureDb() {
  if (!window.db) {
    console.error('window.db not found. Make sure core.js runs before admin.js');
    alert('DB not ready (core.js not loaded).');
    return false;
  }
  return true;
}

/* TAB SWITCH (HTML: showTab('balance', this)) */
function showTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const tab = document.getElementById('tab-' + tabId);
  if (tab) tab.classList.add('active');
  if (el) el.classList.add('active');
}

/* Check user by 6-digit UID */
async function checkUser() {
  if (!ensureDb()) return;

  const uid = (document.getElementById('targetUID')?.value || '').trim();

  if (!uid || uid.length !== 6) {
    alert('UID ၆ လုံးထည့်ပါ');
    return;
  }

  const { data, error } = await window.db
    .from(PROFILE_TABLE)
    .select('uid, username, phone, balance')
    .eq('uid', uid)
    .single();

  if (error || !data) {
    alert('User မတွေ့ပါ');
    console.error(error);
    return;
  }

  const bal = Number(data.balance ?? 0);

  // Optional: show info somewhere (if you add <p id="userInfo"></p>)
  const infoEl = document.getElementById('userInfo');
  if (infoEl) {
    infoEl.textContent = `Found: ${data.username || '-'} | UID: ${data.uid} | Balance: $${bal}`;
  }

  alert(`User Found!\nUID: ${data.uid}\nName: ${data.username || '-'}\nPhone: ${data.phone || '-'}\nBalance: $${bal}`);
}

/* Deposit / Withdraw */
async function adjustBalance(type) {
  if (!ensureDb()) return;

  const uid = (document.getElementById('targetUID')?.value || '').trim();
  const amount = Number(document.getElementById('balanceValue')?.value);

  if (!uid || uid.length !== 6) {
    alert('UID ၆ လုံးထည့်ပါ');
    return;
  }
  if (!amount || amount <= 0) {
    alert('Amount ကိုမှန်ကန်စွာထည့်ပါ');
    return;
  }

  // 1) get current balance
  const { data: user, error: fetchErr } = await window.db
    .from(PROFILE_TABLE)
    .select('balance, username')
    .eq('uid', uid)
    .single();

  if (fetchErr || !user) {
    alert('User မတွေ့ပါ');
    console.error(fetchErr);
    return;
  }

  const current = Number(user.balance ?? 0);
  let next = current;

  if (type === 'add') {
    next = current + amount;
  } else if (type === 'sub') {
    next = current - amount;
    if (next < 0) {
      alert('Balance မလုံလောက်ပါ');
      return;
    }
  } else {
    alert('Invalid action');
    return;
  }

  // 2) update
  const { error: updateErr } = await window.db
    .from(PROFILE_TABLE)
    .update({ balance: next })
    .eq('uid', uid);

  if (updateErr) {
    alert('Update မအောင်မြင်ပါ: ' + updateErr.message);
    console.error(updateErr);
    return;
  }

  alert(`Success!\nNew Balance: $${next}`);
  const infoEl = document.getElementById('userInfo');
  if (infoEl) infoEl.textContent = `Updated: ${user.username || '-'} | UID: ${uid} | Balance: $${next}`;

  const amtEl = document.getElementById('balanceValue');
  if (amtEl) amtEl.value = '';
}