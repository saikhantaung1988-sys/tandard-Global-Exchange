
const supabaseUrl = 'https://qonmwtjznyrfenikqffk.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm13dGp6bnlyZmVuaWtxZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDQ3NzEsImV4cCI6MjA4NjMyMDc3MX0.OgTzG55xr_zkK8pIRp_S4lPG4eTIHunqz5PP_EPEFrs';

const db = supabase.createClient(supabaseUrl, supabaseKey);

// ✅ add-only (non-breaking)
window.db = db;

console.log("✅ New Connection Established via core.js");

async function checkAccess() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) window.location.href = 'blog-grid.html';
}
