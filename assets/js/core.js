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

