let balanceChannel = null;

function setBalanceUI(balance) {
  const el = document.querySelector('#user-balance'); // ← မင်း HTML id ကိုသုံး
  if (!el) return;

  const n = Number(balance ?? 0);
  el.textContent = "$" + n.toFixed(2);
}

async function loadMyBalance() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return;

  const userId = session.user.id;

  const { data, error } = await db
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  if (error) { console.error(error); return; }

  setBalanceUI(data?.balance);
}

async function subscribeMyBalance() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return;

  const userId = session.user.id;

  if (balanceChannel) db.removeChannel(balanceChannel);

  balanceChannel = db
    .channel('balance-watch-' + userId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        setBalanceUI(payload.new.balance);
      }
    )
    .subscribe();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadMyBalance();
  await subscribeMyBalance();
});