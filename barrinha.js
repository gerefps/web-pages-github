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

    const wrapper = document.querySelector('.barrinha-wrapper');
    const contentBox = document.getElementById('barrinhaMarquee');
    
    const evtSource = new EventSource('/api/sync' + window.location.search);

    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.settings && data.settings.brandColor) {
            document.documentElement.style.setProperty('--brand-color', `#${data.settings.brandColor}`);
            document.documentElement.style.setProperty('--neon-blue', `#${data.settings.brandColor}`);
        }
        
        if (data.action === 'show' && data.config) {
            const c = data.config;
            
            wrapper.style.display = 'flex';
            
            contentBox.innerHTML = `
                <div class="barrinha-item" id="barrinhaTextContainer">
                    <span class="barrinha-label">${c.label}</span>
                    <span class="barrinha-value">${c.value}</span>
                    <div class="barrinha-divider"></div>
                </div>
            `;

            requestAnimationFrame(() => {
                const item = contentBox.querySelector('.barrinha-item');
                
                item.style.transform = 'scale(1)';
                
                const availableWidth = wrapper.clientWidth - 30;
                const contentWidth = item.scrollWidth;
                
                if (contentWidth > availableWidth) {
                    const scaleRatio = availableWidth / contentWidth;
                    item.style.transform = `scale(${scaleRatio})`;
                    item.style.transformOrigin = 'center center';
                }

                setTimeout(() => {
                    wrapper.classList.add('active');
                }, 50);
            });

        } else if (data.action === 'hide') {
            wrapper.classList.remove('active');
        }
    };

    if (urlParams.get('preview') === 'true') {
        setTimeout(() => {
            evtSource.onmessage({
                data: JSON.stringify({
                    action: 'show',
                    config: {
                        label: '🎧 Fone',
                        value: 'Astro A40 (PRÉVIA)'
                    }
                })
            });
        }, 500);
    }
});
