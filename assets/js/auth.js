// assets/js/auth.js

async function handleRegister() {
    // ၁။ HTML ထဲက တန်ဖိုးတွေ ယူမယ်
    const username = document.getElementById('reg-username').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-pass').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;

    // ၂။ စစ်ဆေးမှုများ (Validation)
    if (!username || !phone || !password) {
        alert("Please fill all fields!");
        return;
    }
    if (password !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    // Loading ပြမယ် (Button စာသားပြောင်းမယ်)
    const btn = document.querySelector('button'); // သတိပြုရန်: Button tag ကို ဖမ်းထားသည်
    const oldText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // ၃။ Supabase Auth ဖြင့် အကောင့်ဖွင့်မယ် (Fake Email သုံးမယ်)
        const emailFake = phone + "@bibcoin.com";
        
        const { data, error } = await db.auth.signUp({
            email: emailFake,
            password: password
        });

        if (error) throw error; // Error တက်ရင် Catch ကို ပို့မယ်

        const userId = data.user.id;
        // ၄။ ID (ဂဏန်း ၆ လုံး) ထုတ်မယ်
        const randomUID = Math.floor(100000 + Math.random() * 900000).toString();

        // ၅။ Profiles Table ထဲ Data ထည့်မယ်
        const { error: profileError } = await db.from('profiles').insert([{
            id: userId,
            username: username,
            phone: phone,
            password: password, // လိုအပ်လို့ ထည့်ထားသည်
            uid: randomUID
        }]);

        if (profileError) throw profileError;

        // ၆။ Assets Table (ပိုက်ဆံအိတ်) ထဲ Data ထည့်မယ်
        const { error: assetError } = await db.from('assets').insert([{
            user_id: userId, // Profile နဲ့ ချိတ်ဖို့
            uid: randomUID,
            amount: 0,       // စဖွင့်ချင်း ၀ ကျပ်
            currency: 'USDT'
        }]);

        if (assetError) throw assetError;

        // ၇။ အားလုံးအောင်မြင်ရင်
        alert("Account Created Successfully! ID: " + randomUID);
        window.location.href = 'index.html';

    } catch (err) {
        alert("Error: " + err.message);
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// 2. LOGIN FUNCTION
// -----------------------------------
async function handleLogin() {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    const btn = document.querySelector('button'); // Login ခလုတ်ကို ဖမ်းမယ်

    if (!phone || !password) {
        alert("Please fill all fields!");
        return;
    }

    // Loading ပြမယ်
    const oldText = btn.innerText;
    btn.innerText = "Checking...";
    btn.disabled = true;

    try {
        // Register တုန်းကလိုပဲ ဖုန်းနံပါတ်ကို Email ပြောင်းပြီး စစ်မယ်
        const emailFake = phone + "@bibcoin.com";

        const { data, error } = await db.auth.signInWithPassword({
            email: emailFake,
            password: password
        });

        if (error) throw error;

        // Login အောင်မြင်ရင် Dashboard (index.html) ကို ပို့မယ်
        window.location.href = 'index.html';

    } catch (err) {
        alert("Login Failed: " + err.message);
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// 3. LOGOUT FUNCTION
// -----------------------------------
async function handleLogout() {
    const { error } = await db.auth.signOut();
    if (error) {
        alert("Logout Error: " + error.message);
    } else {
        // Logout ထွက်ပြီးရင် Login စာမျက်နှာကို ပြန်ပို့မယ်
        window.location.href = 'blog-grid.html';
    }
}