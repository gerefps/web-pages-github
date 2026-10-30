// ==========================================
// WARZONE BR METAS — AUTH & NAVIGATION SYSTEM
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyDXjDj_MJqSdKmcGuLjwPYE2w8KJv_L-Uk",
  authDomain: "warzone-metas.firebaseapp.com",
  projectId: "warzone-metas",
  storageBucket: "warzone-metas.firebasestorage.app",
  messagingSenderId: "82144100296",
  appId: "1:82144100296:web:7bc2025e4bc1e450754afd"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    try {
        firebase.initializeApp(firebaseConfig);
    } catch(e) {
        console.warn("Firebase initializeApp:", e);
    }
}

// Detecta se a execução é no App Local do Mestre (Electron / localhost) ou no Site Público (GitHub Pages / Web)
const isLocalMaster = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.protocol === 'file:';

const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

if (isLocalMaster) {
    // === MODO MESTRE (APENAS NO SEU COMPUTADOR / EXECUTÁVEL) ===
    const MASTER_USER = {
        uid: 'JslPHq5Xe8VCjUk4jiHsh4z71ff2',
        email: 'gerefps@gmail.com',
        role: 'MASTER'
    };

    window.currentUser = MASTER_USER;
    window.currentUserRole = 'MASTER';
    window.isMaster = true;
    window.isFirebaseReady = true;
    window.authReadyPromise = Promise.resolve(MASTER_USER);

    // Intercepta todas as chamadas de fetch locais para injetar permissão de Mestre
    const originalFetch = window.fetch;
    window.fetch = async function(resource, config = {}) {
        if (typeof resource === 'string' && resource.startsWith('/api/')) {
            config = config || {};
            config.headers = config.headers || {};
            if (config.headers instanceof Headers) {
                if (!config.headers.has('Authorization')) {
                    config.headers.set('Authorization', 'Bearer local-master-token');
                }
            } else if (Array.isArray(config.headers)) {
                config.headers.push(['Authorization', 'Bearer local-master-token']);
            } else {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = 'Bearer local-master-token';
                }
            }
        }
        return originalFetch(resource, config);
    };
} else {
    // === MODO VITRINE PÚBLICA (WEB / GITHUB PAGES) ===
    window.currentUser = null;
    window.currentUserRole = 'GUEST';
    window.isMaster = false;
    window.isFirebaseReady = true;
    window.authReadyPromise = Promise.resolve(null);

    // Bloqueia qualquer tentativa de terceiros acessarem páginas de edição no site público
    const adminPages = ['admin.html', 'admin_weapons.html', 'admin_pros.html', 'admin_overlays.html', 'login.html', 'register.html', 'instagram.html', 'pro_post.html'];
    if (adminPages.includes(currentPage)) {
        window.location.replace('/index.html');
    }
}

const authReadyPromise = window.authReadyPromise;

// Helper para obter token autenticado
async function getAuthToken() {
    return isLocalMaster ? 'local-master-token' : null;
}

// Renderização Unificada da Barra de Navegação
function renderNavbar() {
    const navContainer = document.querySelector('.nav-actions, .nav-links');
    if (!navContainer) return;

    if (isLocalMaster) {
        // Menu exclusivo do Mestre (Local no PC)
        navContainer.innerHTML = `
            <a href="/index.html" class="nav-link-item ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">🏆 Ranking Meta</a>
            <a href="/admin.html" class="nav-link-item ${currentPage === 'admin.html' ? 'active' : ''}">📝 Editor de Classes</a>
            <a href="/admin_weapons.html" class="nav-link-item ${currentPage === 'admin_weapons.html' ? 'active' : ''}">🔫 Armas Base</a>
            <a href="/admin_pros.html" class="nav-link-item ${currentPage === 'admin_pros.html' ? 'active' : ''}">⭐ Criadores PRO</a>
            <a href="/instagram.html" class="nav-link-item ${currentPage === 'instagram.html' ? 'active' : ''}">🎨 Gerador Comum</a>
            <a href="/pro_post.html" class="nav-link-item ${currentPage === 'pro_post.html' ? 'active' : ''}">📸 Gerador PRO</a>
            <a href="/api/export-bundle" class="nav-link-item" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 6px 14px; border-radius: 6px; font-weight: 800; text-shadow: none; margin-left: 8px; border: 1px solid #34d399; box-shadow: 0 0 12px rgba(16,185,129,0.35); text-decoration: none;" title="Baixar pacote ZIP com todas as classes para enviar ao GitHub">📦 Exportar p/ GitHub</a>
            <div style="margin-left:10px; padding: 4px 10px; background: rgba(0, 210, 255, 0.15); border: 1px solid #00d2ff; color: #00d2ff; font-size: 11px; font-weight: 800; border-radius: 4px; letter-spacing: 1px;">👑 MESTRE LOCAL</div>
        `;
    } else {
        // Menu 100% Vitrine para o Público (Web / GitHub Pages)
        navContainer.innerHTML = `
            <a href="https://www.instagram.com/gerefps_/" target="_blank" class="nav-link-item" style="display:inline-flex; align-items:center; gap:6px; color:#e1306c; border:1px solid rgba(225,48,108,0.3); background:rgba(225,48,108,0.06); padding:6px 14px; border-radius:6px; text-decoration:none; font-size:12px; font-weight:700;"><span style="font-size:14px;">📸</span> Siga @gerefps_</a>
            <button class="btn-support" onclick="document.getElementById('livepixModal') ? document.getElementById('livepixModal').style.display='flex' : (document.getElementById('pix-btn') && document.getElementById('pix-btn').click())" style="padding: 6px 14px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.35); color: #22c55e; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif;">💚 Apoie via Pix</button>
        `;
    }
}

// Inicializa imediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (isLocalMaster) document.body.classList.add('user-is-pro');
        renderNavbar();
    });
} else {
    if (isLocalMaster) document.body.classList.add('user-is-pro');
    renderNavbar();
}
