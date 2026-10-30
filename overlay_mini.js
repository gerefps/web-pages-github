document.addEventListener('DOMContentLoaded', () => {
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

    const container = document.getElementById('miniContainer');
    const nameEl = document.getElementById('weaponName');
    const codeEl = document.getElementById('weaponCode');
    
    const evtSource = new EventSource('/api/sync' + window.location.search);

    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.settings && data.settings.brandColor) {
            document.documentElement.style.setProperty('--brand-color', `#${data.settings.brandColor}`);
            document.documentElement.style.setProperty('--neon-blue', `#${data.settings.brandColor}`);
        }
        
        if (data.action === 'show' && data.miniWeapon) {
            const w = data.miniWeapon;
            
            nameEl.textContent = w.name;
            codeEl.textContent = w.code;

            requestAnimationFrame(() => {
                const contentContainer = document.getElementById('contentContainer');
                contentContainer.style.transform = 'scale(1)';

                const availableWidth = container.clientWidth - 30;
                const contentWidth = contentContainer.scrollWidth;

                if (contentWidth > availableWidth) {
                    const scaleRatio = availableWidth / contentWidth;
                    contentContainer.style.transform = `scale(${scaleRatio})`;
                    contentContainer.style.transformOrigin = 'center center';
                }

                setTimeout(() => {
                    container.classList.add('visible');
                }, 50);
            });

        } else if (data.action === 'hide') {
            container.classList.remove('visible');
        }
    };

    if (urlParams.get('preview') === 'true') {
        setTimeout(() => {
            evtSource.onmessage({
                data: JSON.stringify({
                    action: 'show',
                    miniWeapon: {
                        name: 'STG44 (PRÉVIA)',
                        code: 'STG-12345'
                    }
                })
            });
        }, 500);
    }
});
