// ၁။ Supabase ချိတ်ဆက်မှု (New Project Credentials)

const supabaseUrl = 'https://qonmwtjznyrfenikqffk.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm13dGp6bnlyZmVuaWtxZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDQ3NzEsImV4cCI6MjA4NjMyMDc3MX0.OgTzG55xr_zkK8pIRp_S4lPG4eTIHunqz5PP_EPEFrs';



const db = supabase.createClient(supabaseUrl, supabaseKey);



console.log("✅ New Connection Established via core.js");

// ၄။ SEND MESSAGE (User ဘက်က စာပို့ခြင်း - အရင်ပေးထားတဲ့ Optimistic UI)
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    const uid = localStorage.getItem('sgx_user_id');

    if (text !== "" && uid) {
        // UI မှာ ချက်ချင်းအရင်ပြ (စောင့်မနေဘူး)
        renderTextMessage(text, 'right'); 
        
        const display = document.getElementById('chat-display');
        display.scrollTop = display.scrollHeight;
        input.value = ""; 

        // Database ထဲပို့ (Background Process)
        await db.from('messages').insert([
            { uid: uid, content: text, type: 'text', is_admin: false }
        ]);
    }
}
// ၃။ HISTORY LOADER (စာဟောင်းများ ပြန်လည်နေရာချထားရေး)
async function loadChatHistory(uid) {
    // Database ထဲက ကိုယ့် UID နဲ့ဆိုင်တဲ့ စာတွေကိုပဲ ရွေးထုတ်မယ်
    const { data } = await db.from('messages')
        .select('*')
        .eq('uid', uid) // 👈 UID Filter ဒီမှာလည်း ပါပါတယ်
        .order('created_at', { ascending: true });

    const display = document.getElementById('chat-display');
    
    if (display && data) {
        display.innerHTML = ""; // မျက်နှာပြင်ကို ရှင်းမယ်
        
        data.forEach(msg => {
            // Admin စာဆို ဘယ် (Left)၊ ကိုယ့်စာဆို ညာ (Right)
            const side = msg.is_admin ? 'left' : 'right';
            
            if (msg.type === 'image') renderImageMessage(msg.content, side);
            else renderTextMessage(msg.content, side);
        });
        
        // စာအောက်ဆုံးရောက်အောင် Scroll ဆွဲချမယ်
        setTimeout(() => display.scrollTop = display.scrollHeight, 100);
    }
}
// UI Helper Functions (စာသားနှင့် ပုံများပြရန်)
function renderTextMessage(text, side) {
    const display = document.getElementById('chat-display');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    msgDiv.innerText = text;
    display.appendChild(msgDiv);
    display.scrollTop = display.scrollHeight;
}

function renderImageMessage(url, side) {
    const display = document.getElementById('chat-display');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    const img = document.createElement('img');
    img.src = url;
    img.className = 'chat-image';
    msgDiv.appendChild(img);
    display.appendChild(msgDiv);
    display.scrollTop = display.scrollHeight;
}

// ၂။ MASTER ROUTING SYSTEM (လမ်းကြောင်းခွဲခြားပေးမည့် စက်)
let myMasterSubscription = null;

/* --- 3. ROBUST REALTIME LISTENER (Chat + Balance) --- */
let mySubscription = null;

function initRealtimeSystem(uid) {
    // History အရင် ဆွဲတင်မယ်
    loadChatHistory(uid);

    // Subscription အဟောင်းရှိရင် ဖျက် (Double connection မဖြစ်အောင်)
    if (mySubscription) db.removeChannel(mySubscription);

    // Channel တစ်ခုတည်းမှာ အကုန်နားထောင်မယ် (Performance ကောင်းတယ်)
    mySubscription = db.channel('premium-listener')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            (payload) => {
                const msg = payload.new;
                // Admin ဆီက စာဝင်လာရင် (သို့) ကိုယ်ပို့လိုက်တဲ့စာ Database ထဲရောက်သွားရင်
                // (ကိုယ့်စာကိုတော့ UI မှာပြပြီးသားမို့ ထပ်မပြဘူး)
                if (msg.uid === uid && msg.is_admin === true) {
                    if (msg.type === 'text') renderTextMessage(msg.content, 'left');
                    else renderImageMessage(msg.content, 'left');
                    
                    // Sound Effect ထည့်ချင်ရင် ဒီနေရာမှာ ထည့်လို့ရတယ်
                }
            }
        )
        .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${uid}` }, 
            (payload) => {
                // Balance ပြောင်းတာနဲ့ ချက်ချင်း ဂဏန်းပြောင်းမယ်
                const newBal = payload.new.content.balance;
                const balEl = document.getElementById('user-balance');
                if(balEl) {
                    balEl.innerText = `$${parseFloat(newBal).toFixed(2)}`;
                    // Animation အသေးစားလေး (အရောင်မှိတ်တုတ်) လုပ်ချင်ရင် CSS class add လို့ရ
                    balEl.style.color = '#0ecb81'; // Green flash
                    setTimeout(() => balEl.style.color = '', 500); 
                }
            }
        )
        .subscribe((status) => {
            console.log("Realtime Status:", status);
        });
}

// Paperclip နှိပ်ရင် ဝှက်ထားတဲ့ File Input ကို လှမ်းနှိပ်မယ်
function triggerImageUpload() {
    document.getElementById('image-upload-input').click();
}

// ဖိုင်ရွေးပြီးသွားရင် အလုပ်လုပ်မယ့် Function
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ပုံဟုတ်မဟုတ် စစ်ဆေးခြင်း (လုံခြုံရေးအရ)
    if (!file.type.startsWith('image/')) {
        showToast("Please select an image file!", "error");
        return;
    }

    // FileReader သုံးပြီး ပုံကို ဖတ်မယ် (Preview ပြဖို့)
    const reader = new FileReader();
   reader.onload = async function(e) {
        const imageUrl = e.target.result;
        const uid = localStorage.getItem('sgx_user_id');

        if (uid) {
            // Database ထဲသို့ ပုံကို အစစ်အမှန် ပို့လိုက်ပြီ
            const { error } = await db.from('messages').insert([
                { uid: uid, content: imageUrl, type: 'image', is_admin: false }
            ]);
            
            if(error) showToast("Failed to send image", "error");
        }
    };

    // Input ကို ပြန်ရှင်းမယ် (နောက်တစ်ခါ ထပ်ရွေးလို့ရအောင်)
    event.target.value = ''; 
}

// Chat Box ထဲမှာ ပုံကို ပြသခြင်း
function displayImageMessage(url, side) {
    const display = document.getElementById('chat-display');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    
    // ပုံ Tag တည်ဆောက်ခြင်း
    const img = document.createElement('img');
    img.src = url;
    img.className = 'chat-image';
    
    msgDiv.appendChild(img);
    display.appendChild(msgDiv);
    
    // အောက်ဆုံးကို Scroll ဆွဲချမယ်
    setTimeout(() => {
        display.scrollTop = display.scrollHeight;
    }, 100);
}
