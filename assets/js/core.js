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

function showToast(msg, type) {
    const x = document.getElementById("toast-box");
    if(!x) return;
    x.innerText = msg;
    x.className = "show " + type; 
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
}
function nav(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('btn-' + pageId);
    if(navBtn) navBtn.classList.add('active');
    
    if(pageId === 'markets') loadTradingView(currentSymbol);
}

async function initMasterSystem(uid) {
    console.log("Initializing Routing System for ID:", uid);

    // (A) HISTORY: အရင်ဆုံး စာဟောင်းတွေကို UID နဲ့ စစ်ပြီး ပြန်စီမယ်
    await loadChatHistory(uid);

    // (B) REAL-TIME ROUTING: ကိုယ့် ID နဲ့လာတဲ့ စာကိုပဲ ဖမ်းယူမည့် စနစ်
    if (myMasterSubscription) db.removeChannel(myMasterSubscription);

    myMasterSubscription = db.channel('user-exclusive-channel')
        // ၁။ CHAT ROUTING (မိတ်ဆွေ မေးထားတဲ့ အဓိက အပိုင်း)
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages', 
                filter: `uid=eq.${uid}` // 👈 ဒါပါပဲ! ကိုယ့် UID နဲ့တူမှ လက်ခံမယ်
            }, 
            (payload) => {
                const msg = payload.new;
                
                // Admin ဆီက စာဝင်လာရင် (is_admin: true)
                if (msg.is_admin === true) {
                    console.log("Received Message from Admin via Routing:", msg);
                    
                    // Text ဆို Text, Image ဆို Image ခွဲပြီးပြမယ်
                    if (msg.type === 'text') renderTextMessage(msg.content, 'left');
                    else renderImageMessage(msg.content, 'left');

                    // ဖုန်းကို တုန်ခါစေတာမျိုး၊ အသံမြည်တာမျိုး ဒီမှာ ထည့်လို့ရပါတယ်
                }
            }
        )
        // ၂။ BALANCE ROUTING (ကိုယ့်ပိုက်ဆံအိတ် ပြောင်းလဲမှုကိုပဲ နားထောင်မယ်)
        .on('postgres_changes', 
            { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'users', 
                filter: `id=eq.${uid}` // 👈 ကိုယ့် ID ပိုက်ဆံအိတ်ပဲ ကြည့်မယ်
            }, 
            (payload) => {
                const newBal = payload.new.content.balance;
                const balEl = document.getElementById('user-balance');
                if(balEl) {
                    balEl.innerText = `$${parseFloat(newBal).toFixed(2)}`;
                }
            }
        )
        .subscribe((status) => {
            console.log("Routing Connection Status:", status);
        });
}

/* --- MAIN APP LOGIC (DASHBOARD) --- */

function enterUniverse(user) {
    // ၁။ UI Transition
    const auth = document.getElementById('auth-section');
    const app = document.getElementById('app-section');
    if(auth) auth.style.display = 'none';
    if(app) {
        app.style.display = 'block';
        document.body.style.overflow = 'auto';
    }
    
    // ၂။ Profile Data Rendering (FIXED Property Names)
    if (user) {
        const nameEl = document.getElementById('profile-name');
        const phoneEl = document.getElementById('profile-phone');
        const balEl = document.getElementById('user-balance');
        
        if(nameEl) nameEl.innerText = user.username; 
        if(phoneEl) phoneEl.innerText = "ID: " + user.uid;
        if(balEl) balEl.innerText = "$" + (user.balance || 0).toLocaleString();
    }

    // ၃။ Initialize Systems
    initMarketSystem();
}

// PREMIUM UID GENERATOR
function generatePremiumUID() {
    return Math.floor(100000 + Math.random() * 900000);
}

// ၁။ SESSION & HISTORY RESTORATION (Refresh လုပ်ရင် မပျောက်အောင်ထိန်းသိမ်းခြင်း)
document.addEventListener('DOMContentLoaded', async () => {
    const storedUID = localStorage.getItem('sgx_user_id');

    // Slider စနစ်ရှိရင် Run မယ်
    if (typeof startSlider === "function") startSlider();

    if (storedUID) {
        console.log("Active Session Found for:", storedUID);

        // UI မျက်နှာစာ ပြောင်းမယ် (Login -> App)
        const loginPage = document.getElementById('login-page');
        const appContainer = document.getElementById('app-container');
        if (loginPage) loginPage.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';

        // *** အဓိက အသက် ***
        // Chat Routing စနစ်နဲ့ History ကို တပြိုင်နက်တည်း မောင်းနှင်မယ်
        initMasterSystem(storedUID);
        
        // Balance ကို တစ်ခါတည်း ဆွဲတင်မယ်
        fetchUserData(storedUID);
    } else {
        // User မရှိမှ Login ပြမယ်
        if(document.getElementById('login-page')) {
            document.getElementById('login-page').style.display = 'flex';
        }
    }
});
