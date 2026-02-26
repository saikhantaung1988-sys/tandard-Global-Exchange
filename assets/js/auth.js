// assets/js/auth.js

// ---------- helpers ----------
function pickBtn(preferId, fallbackSelector = 'button') {
  return document.getElementById(preferId) || document.querySelector(fallbackSelector);
}

async function generateUniqueUID() {
  // Try a few times to avoid collision (premium)
  for (let i = 0; i < 8; i++) {
    const uid = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await db
      .from('profiles')
      .select('uid')
      .eq('uid', uid)
      .maybeSingle();

    if (error) {
      console.error('UID check error:', error);
      // continue trying
    } else if (!data) {
      return uid; // unique
    }
  }
  // fallback (rare)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------- 1) REGISTER ----------
async function handleRegister() {
  const username = document.getElementById('reg-username')?.value?.trim();
  const phone = document.getElementById('reg-phone')?.value?.trim();
  const password = document.getElementById('reg-pass')?.value;
  const confirmPass = document.getElementById('reg-confirm-pass')?.value;

  if (!username || !phone || !password) return alert("Please fill all fields!");
  if (password !== confirmPass) return alert("Passwords do not match!");

  const btn = pickBtn('reg-btn');
  const oldText = btn?.innerText || '';
  if (btn) { btn.innerText = "Processing..."; btn.disabled = true; }

  try {
    // Fake email pattern (as you designed)
    const emailFake = phone + "@bibcoin.com";

    const { data, error } = await db.auth.signUp({
      email: emailFake,
      password: password
    });

    if (error) throw error;
    const userId = data?.user?.id;
    if (!userId) throw new Error("No user id returned.");

    // ✅ unique 6-digit uid
    const randomUID = await generateUniqueUID();

    // ✅ Profiles table only (store balance here)
    const { error: profileError } = await db.from('profiles').insert([{
      id: userId,
      username: username,
      phone: phone,
      uid: randomUID,
      balance: 0  // ✅ Start balance
      // ❌ DO NOT store password in profiles (security)
    }]);

    if (profileError) throw profileError;

    alert("Account Created Successfully! UID: " + randomUID);
    window.location.href = 'index.html';

  } catch (err) {
    alert("Error: " + (err?.message || err));
    console.error(err);
    if (btn) { btn.innerText = oldText; btn.disabled = false; }
    return;
  }
}

// ---------- 2) LOGIN ----------
async function handleLogin() {
  const phone = document.getElementById('login-phone')?.value?.trim();
  const password = document.getElementById('login-password')?.value;

  if (!phone || !password) return alert("Please fill all fields!");

  const btn = pickBtn('login-btn');
  const oldText = btn?.innerText || '';
  if (btn) { btn.innerText = "Checking..."; btn.disabled = true; }

  try {
    const emailFake = phone + "@bibcoin.com";

    const { error } = await db.auth.signInWithPassword({
      email: emailFake,
      password: password
    });

    if (error) throw error;

    window.location.href = 'index.html';

  } catch (err) {
    alert("Login Failed: " + (err?.message || err));
    console.error(err);
    if (btn) { btn.innerText = oldText; btn.disabled = false; }
  }
}

// ---------- 3) LOGOUT ----------
async function handleLogout() {
  const { error } = await db.auth.signOut();
  if (error) {
    alert("Logout Error: " + error.message);
  } else {
    window.location.href = 'blog-grid.html';
  }
}