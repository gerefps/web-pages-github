document.addEventListener('DOMContentLoaded', async () => {
    // Dynamic Brand Color via URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const customColor = urlParams.get('color');
    if (customColor) {
        let style = document.createElement('style');
        style.innerHTML = `
            :root {
                --brand-color: #${customColor} !important;
                --neon-blue: #${customColor} !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    const evtSource = new EventSource('/api/sync' + window.location.search);
    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.settings && data.settings.brandColor) {
            document.documentElement.style.setProperty('--brand-color', `#${data.settings.brandColor}`);
            document.documentElement.style.setProperty('--neon-blue', `#${data.settings.brandColor}`);
        }
        
        if (data.action === 'show') {
            fetch('/api/public-pros' + window.location.search);
        }
    };

    try {
        const response = await fetch('/api/public-pros' + window.location.search);
        let weapons = await response.json();
        
        if (urlParams.get('preview') === 'true' && (!weapons || weapons.length === 0)) {
            weapons = [
                { name: 'STG44 (PRÉVIA)', code: 'STG-12345' },
                { name: 'KAR98K (PRÉVIA)', code: 'KAR-98765' }
            ];
        }

        if (!weapons || weapons.length === 0) return;

        let itemsHtml = '';
        
        weapons.forEach(w => {
            if (w.code && w.code.trim() !== '') {
                const displayName = w.weaponName || w.name;
                itemsHtml += `
                    <div class="ticker-item">
                        <span class="ticker-weapon">${displayName}</span>
                        <span class="ticker-code">${w.code}</span>
                        <span class="ticker-separator">•</span>
                    </div>
                `;
            }
        });

        const container = document.getElementById('tickerContent');
        
        // Duplicamos o conteúdo para criar um loop infinito contínuo.
        // A animação move -50% (tamanho exato do conteúdo original)
        container.innerHTML = itemsHtml + itemsHtml;

        // Ajustamos o tempo da animação dinamicamente baseado na quantidade de armas.
        // Cerca de 6 segundos por arma para dar tempo de ler confortavelmente.
        const itemsCount = weapons.filter(w => w.code && w.code.trim() !== '').length;
        const duration = itemsCount * 6;
        
        container.style.animation = `scroll ${duration}s linear infinite`;

    } catch (e) {
        console.error('Erro ao carregar as armas para a barrinha (ticker):', e);
    }
});
