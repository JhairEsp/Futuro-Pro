/**
 * KLYON CONNECT DEBUG VERSION
 */

console.log('🚀 KLYON FILE LOADED');

const KLYON = {
  url: 'https://klyon-manage.vercel.app/api/status',
  projectId: 'e706c6c6-8cf8-4737-b74e-df09b1ab8e1a',
  apiKey: 'ea68fa080ca4b284608bf43c91c0f7da353aeff007f59ddf'
};

let metrics = {
  sessions: 0,
  sales: 0,
  errors: 0
};

// ==========================================
// 📌 SESIÓN
// ==========================================
if (!sessionStorage.getItem('k_s')) {
  metrics.sessions = 1;
  sessionStorage.setItem('k_s', 'true');
}

console.log('📊 Metrics iniciales:', metrics);

// ==========================================
// ❌ ERRORES
// ==========================================
window.addEventListener('error', (e) => {
  metrics.errors++;

  console.error('❌ JS ERROR:', e.error);
});

// ==========================================
// 🔒 BLOQUEO
// ==========================================
const showSuspendedScreen = () => {

  console.warn('🚫 SITIO SUSPENDIDO');

  const root = document.getElementById('root');

  if (root) {
    root.innerHTML = `
      <div style="
        position:fixed;
        inset:0;
        background:#020617;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        z-index:999999;
        font-family:sans-serif;
      ">
        <div style="text-align:center;">
          <h1>SITIO SUSPENDIDO</h1>
          <p>Contacta al administrador.</p>
        </div>
      </div>
    `;
  }
};

// ==========================================
// 📡 SYNC
// ==========================================
const syncKlyon = async () => {

  console.log('📡 Enviando a Klyon...');

  try {

    const payload = {
      projectId: KLYON.projectId,
      apiKey: KLYON.apiKey,
      sessions: metrics.sessions,
      sales: metrics.sales,
      errors: metrics.errors
    };

    console.log('📦 Payload:', payload);

    const response = await fetch(KLYON.url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);

    const text = await response.text();

    console.log('📥 RAW RESPONSE:', text);

    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('❌ JSON inválido');
      return;
    }

    console.log('✅ KLYON RESPONSE:', data);

    // ==========================================
    // 🚫 SUSPENSIÓN
    // ==========================================
    if (data.status === 'suspended') {
      showSuspendedScreen();
      return;
    }

    // ==========================================
    // ⚠ POPUP
    // ==========================================
    if (
      data.config &&
      data.config.show_popup &&
      !sessionStorage.getItem('k_a')
    ) {

      alert(
        data.config.message ||
        'Aviso importante'
      );

      sessionStorage.setItem('k_a', 'true');
    }

    // ==========================================
    // 🧹 LIMPIAR
    // ==========================================
    metrics.sessions = 0;
    metrics.sales = 0;
    metrics.errors = 0;

    console.log('🧹 Metrics limpiadas');

  } catch (e) {

    console.error('❌ ERROR KLYON:', e);

  }
};

// ==========================================
// 🚀 START
// ==========================================
syncKlyon();

const klyonInterval = setInterval(syncKlyon, 60000);

// ==========================================
// 💰 GLOBAL
// ==========================================
(window as any).reportKlyonSale = (amount = 1) => {

  metrics.sales += amount;

  console.log('💰 Venta registrada:', amount);

  syncKlyon();
};

export {};
