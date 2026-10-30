document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('cardsGrid');
    const renderZone = document.getElementById('renderZone');

    const attachmentLabels = {
        'boca': 'BOCA',
        'cano': 'CANO',
        'lente': 'LENTE',
        'coronha': 'CORONHA',
        'acoplamento': 'ACOPLAMENTO',
        'carregador': 'CARREGADOR',
        'cabo': 'CABO',
        'laser': 'LASER',
        'mods': 'MODS DE DISPARO'
    };

    let weapons = [];
    let globalBrandColor = '00d2ff';
    try {
        const res = await fetch('/api/weapons');
        weapons = await res.json();
        
        try {
            const setRes = await fetch('/api/settings');
            const settings = await setRes.json();
            if (settings.brandColor) {
                globalBrandColor = settings.brandColor;
                document.documentElement.style.setProperty('--brand-color', `#${globalBrandColor}`);
            }
        } catch(e) {}
    } catch (e) {
        grid.innerHTML = '<p style="color:#ff5555; text-align:center; grid-column:1/-1;">Erro ao carregar armas. O servidor está rodando?</p>';
        return;
    }
    
    function preRenderBlur(imgSrc, width, height, blurAmount, brightness, tintColorHex) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = width;
                c.height = height;
                const ctx = c.getContext('2d');
                ctx.filter = `blur(${blurAmount}px) brightness(${brightness})`;
                
                const canvasRatio = c.width / c.height;
                const imgRatio = img.width / img.height;
                let drawWidth, drawHeight, offsetX, offsetY;

                if (canvasRatio > imgRatio) {
                    drawWidth = c.width + blurAmount*4;
                    drawHeight = (img.height * (c.width / img.width)) + blurAmount*4;
                    offsetX = -blurAmount*2;
                    offsetY = ((c.height - drawHeight) / 2) - blurAmount*2;
                } else {
                    drawWidth = (img.width * (c.height / img.height)) + blurAmount*4;
                    drawHeight = c.height + blurAmount*4;
                    offsetX = ((c.width - drawWidth) / 2) - blurAmount*2;
                    offsetY = -blurAmount*2;
                }
                
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                
                if (tintColorHex) {
                    ctx.globalCompositeOperation = 'color';
                    ctx.fillStyle = `#${tintColorHex}`;
                    ctx.fillRect(0, 0, width, height);
                    ctx.globalCompositeOperation = 'source-over';
                }
                resolve(c.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject;
            img.src = imgSrc;
        });
    }

    if (weapons.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-gray); text-align:center; grid-column:1/-1;">Nenhuma classe cadastrada ainda. Vá ao Painel Admin e adicione suas armas primeiro!</p>';
        return;
    }

    weapons.forEach((weapon, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'stories-card-wrapper';

        let attachmentsPreviewHTML = '';
        for (const [key, value] of Object.entries(weapon.attachments)) {
            const attName = (typeof value === 'object' && value.name) ? value.name : (typeof value === 'string' ? value : '');
            attachmentsPreviewHTML += `
                <div class="attachment-row">
                    <span class="att-type">${attachmentLabels[key] || key}</span>
                    <span class="att-name">${attName}</span>
                </div>
            `;
        }

        let ttkPreviewHTML = '';
        if (weapon.ttk && weapon.ttk.trim() !== '') {
            ttkPreviewHTML = `<div class="weapon-ttk" style="font-size:1.8rem; margin-top:10px;">${weapon.ttk}</div>`;
        }

        let codePreviewHTML = '';
        if (weapon.code && weapon.code.trim() !== '') {
            codePreviewHTML = `
                <div class="weapon-code-box">
                    <span class="code-label">CÓDIGO DA CLASSE</span>
                    <span class="code-value">${weapon.code}</span>
                </div>
            `;
        }

        wrapper.innerHTML = `
            <div class="stories-preview">
                <div class="stories-card-mini">
                    <div class="weapon-header">
                        <div class="weapon-subtitle">CLASSES DO GEREFPS</div>
                        <div class="weapon-title" style="font-size:1.8rem;">${weapon.name}</div>
                    </div>
                    <div class="attachments-list">
                        ${attachmentsPreviewHTML}
                    </div>
                    ${ttkPreviewHTML}
                    ${codePreviewHTML}
                </div>
            </div>
            <button class="btn btn-download" data-index="${index}">
                ⬇ Baixar JPG (Stories)
            </button>
        `;

        grid.appendChild(wrapper);
    });

    // --- Função para gerar o HTML do card ---
    function buildAttRows(weapon) {
        let rows = '';
        for (const [key, value] of Object.entries(weapon.attachments)) {
            const attName = (typeof value === 'object' && value.name) ? value.name : (typeof value === 'string' ? value : '');
            rows += `
                <div style="display:flex; justify-content:space-between; align-items:center; background-color:rgba(0,80,120,0.15); padding:22px 30px; border-radius:8px; border-left:4px solid #00d2ff; margin-bottom:12px;">
                    <span style="font-size:20px; color:#00d2ff; text-transform:uppercase; font-weight:800; letter-spacing:1px;">${attachmentLabels[key] || key}</span>
                    <span style="font-size:24px; color:#ffffff; font-weight:600; text-align:right; line-height:1.2;">${attName}</span>
                </div>
            `;
        }
        return rows;
    }

    // --- Lógica de Download ---
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const index = parseInt(e.target.dataset.index);
            const weapon = weapons[index];

            btn.textContent = '⏳ Gerando imagem...';
            btn.disabled = true;

            // Limpar render zone
            renderZone.innerHTML = '';

            // Construir card como elemento DOM com dimensões explícitas
            const card = document.createElement('div');
            card.style.width = '1080px';
            card.style.minWidth = '1080px';
            card.style.flexShrink = '0';
            card.style.height = '1920px';
            card.style.backgroundColor = '#050d1a';
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.style.fontFamily = 'Inter, sans-serif';
            card.style.color = '#ffffff';

            // Fundo com blur (Using img instead of div for preRenderBlur)
            const bgBlur = document.createElement('img');
            bgBlur.src = 'fundo_app.jpg';
            bgBlur.className = 'dynamic-bg';
            bgBlur.setAttribute('style', 'position:absolute; top:-20px; left:-20px; right:-20px; bottom:-20px; width:calc(100% + 40px); height:calc(100% + 40px); object-fit:cover; filter:blur(12px); opacity:0.7; z-index:0;');
            card.appendChild(bgBlur);

            // Dark overlay
            const darkOverlay = document.createElement('div');
            darkOverlay.setAttribute('style', 'position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.35); z-index:1;');
            card.appendChild(darkOverlay);

            // Cantos decorativos
            const cornerStyles = [
                'top:50px; left:40px; border-top:2px solid rgba(0,210,255,0.3); border-left:2px solid rgba(0,210,255,0.3);',
                'top:50px; right:40px; border-top:2px solid rgba(0,210,255,0.3); border-right:2px solid rgba(0,210,255,0.3);',
                'bottom:50px; left:40px; border-bottom:2px solid rgba(0,210,255,0.3); border-left:2px solid rgba(0,210,255,0.3);',
                'bottom:50px; right:40px; border-bottom:2px solid rgba(0,210,255,0.3); border-right:2px solid rgba(0,210,255,0.3);'
            ];
            cornerStyles.forEach(cs => {
                const c = document.createElement('div');
                c.setAttribute('style', 'position:absolute; width:30px; height:30px; ' + cs);
                card.appendChild(c);
            });

            // Linha superior decorativa
            const lineTop = document.createElement('div');
            lineTop.setAttribute('style', 'position:absolute; top:80px; left:100px; width:880px; height:1px; background-color:rgba(0,210,255,0.15);');
            card.appendChild(lineTop);

            // Linha inferior decorativa
            const lineBottom = document.createElement('div');
            lineBottom.setAttribute('style', 'position:absolute; bottom:80px; left:100px; width:880px; height:1px; background-color:rgba(0,210,255,0.1);');
            card.appendChild(lineBottom);

            // Container de conteúdo
            const content = document.createElement('div');
            content.setAttribute('style', 'position:absolute; top:0; left:0; width:1080px; height:1920px; display:flex; flex-direction:column; padding:130px 70px 100px; z-index:3;');

            // Badge WARZONE
            const badge = document.createElement('div');
            badge.setAttribute('style', 'text-align:center; margin-bottom:30px;');
            const badgeSpan = document.createElement('span');
            badgeSpan.setAttribute('style', 'display:inline-block; padding:8px 35px; border:1px solid rgba(0,210,255,0.3); border-radius:4px; font-size:16px; color:rgba(0,210,255,0.7); letter-spacing:8px; font-weight:600; background-color:rgba(0,40,60,0.3);');
            badgeSpan.textContent = 'WARZONE';
            badge.appendChild(badgeSpan);
            content.appendChild(badge);

            // Subtítulo
            const sub = document.createElement('div');
            sub.setAttribute('style', 'text-align:center; font-size:26px; color:#00d2ff; text-transform:uppercase; letter-spacing:6px; font-weight:800; margin-bottom:8px;');
            sub.textContent = 'CLASSES DO GEREFPS';
            content.appendChild(sub);

            // Linha divisória pequena
            const divSmall = document.createElement('div');
            divSmall.setAttribute('style', 'width:200px; height:2px; background-color:#00d2ff; margin:12px auto 25px;');
            content.appendChild(divSmall);

            // Nome da arma
            const title = document.createElement('div');
            title.setAttribute('style', 'text-align:center; font-family:Teko,sans-serif; font-size:120px; line-height:1; text-transform:uppercase; color:#ffffff; margin-bottom:15px; letter-spacing:3px;');
            title.textContent = weapon.name;
            content.appendChild(title);

            // Linha divisória grande
            const divBig = document.createElement('div');
            divBig.setAttribute('style', 'width:600px; height:3px; background-color:#00d2ff; margin:10px auto 50px; border-radius:2px;');
            content.appendChild(divBig);

            // Acessórios
            const attBox = document.createElement('div');
            attBox.setAttribute('style', 'flex:1 1 auto;');
            attBox.innerHTML = buildAttRows(weapon);
            content.appendChild(attBox);

            // TTK
            if (weapon.ttk && weapon.ttk.trim() !== '') {
                const ttkVal = document.createElement('div');
                ttkVal.setAttribute('style', 'font-family:Teko,sans-serif; font-size:65px; color:#ffffff; font-weight:700; text-align:center; margin-top:10px; margin-bottom: -15px; letter-spacing:3px; text-shadow: 4px 4px 0px rgba(0,0,0,0.8); line-height:1;');
                ttkVal.textContent = weapon.ttk;
                content.appendChild(ttkVal);
            }

            // Código da classe
            if (weapon.code && weapon.code.trim() !== '') {
                const codeBox = document.createElement('div');
                codeBox.setAttribute('style', 'margin-top:35px; background-color:rgba(0,60,90,0.2); border:2px solid rgba(0,210,255,0.35); padding:28px 30px; border-radius:10px; text-align:center;');

                const codeLabel = document.createElement('div');
                codeLabel.setAttribute('style', 'font-size:16px; color:rgba(255,255,255,0.5); text-transform:uppercase; margin-bottom:12px; font-weight:700; letter-spacing:3px;');
                codeLabel.textContent = 'CÓDIGO DA CLASSE';

                const codeVal = document.createElement('div');
                codeVal.setAttribute('style', 'font-family:Teko,monospace; font-size:46px; color:#00d2ff; font-weight:700; letter-spacing:3px;');
                codeVal.textContent = weapon.code;

                codeBox.appendChild(codeLabel);
                codeBox.appendChild(codeVal);
                content.appendChild(codeBox);
            }

            // Rodapé
            const footer = document.createElement('div');
            footer.setAttribute('style', 'margin-top:50px; text-align:center; padding-top:20px;');

            const footerLine = document.createElement('div');
            footerLine.setAttribute('style', 'width:120px; height:2px; background-color:rgba(0,210,255,0.3); margin:0 auto 18px;');
            footer.appendChild(footerLine);

            const footerText = document.createElement('div');
            footerText.setAttribute('style', 'font-size:20px; color:rgba(255,255,255,0.2); text-transform:uppercase; letter-spacing:8px; font-weight:700;');
            footerText.textContent = 'GEREFPS';
            footer.appendChild(footerText);

            content.appendChild(footer);
            card.appendChild(content);

            // Posicionar render zone - visível mas atrás de tudo
            renderZone.style.position = 'fixed';
            renderZone.style.top = '0';
            renderZone.style.left = '0';
            renderZone.style.zIndex = '-1';
            renderZone.style.overflow = 'visible';

            renderZone.appendChild(card);

            // Esperar renderização do browser
            await new Promise(resolve => setTimeout(resolve, 300));

            // --- Pre-render Blur ---
            try {
                const bgImg = card.querySelector('.dynamic-bg');
                if (bgImg) {
                    const blurredDataUrl = await preRenderBlur(
                        bgImg.src, 
                        1080 + 40, 1920 + 40, 
                        12, 1.0, globalBrandColor
                    );
                    bgImg.style.filter = 'none';
                    bgImg.src = blurredDataUrl;
                }
            } catch(e) {
                console.warn('Could not pre-blur image', e);
            }

            // --- FASE 2: Geração da Imagem ---
            try {
                const clone = card.cloneNode(true);
                const origCanvases = card.querySelectorAll('canvas');
                const cloneCanvases = clone.querySelectorAll('canvas');
                origCanvases.forEach((c, i) => {
                    const img = document.createElement('img');
                    try { img.src = c.toDataURL('image/png'); } catch(e){}
                    img.className = c.className;
                    img.id = c.id;
                    img.style.cssText = c.style.cssText;
                    if(cloneCanvases[i].parentNode) {
                        cloneCanvases[i].parentNode.replaceChild(img, cloneCanvases[i]);
                    }
                });
                const html = clone.outerHTML;
                const res = await fetch('/api/render-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html, width: 1080, height: 1920, isStory: true })
                });
                
                if (!res.ok) throw new Error('Falha no servidor ao gerar imagem');
                
                const blob = await res.blob();
                const dataUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const safeName = weapon.name.replace(/[^a-zA-Z0-9]/g, '_');
                link.download = `GEREFPS_${safeName}.jpg`;
                link.href = dataUrl;
                link.click();

                btn.textContent = '✅ Baixado!';
                setTimeout(() => {
                    btn.textContent = '⬇ Baixar JPG (Stories)';
                    btn.disabled = false;
                }, 2000);

            } catch (err) {
                console.error('Erro html2canvas:', err);
                alert('Erro ao gerar a imagem: ' + err.message);
                btn.textContent = '⬇ Baixar JPG (Stories)';
                btn.disabled = false;
            } finally {
                renderZone.innerHTML = '';
                renderZone.style.position = 'absolute';
                renderZone.style.left = '-9999px';
                renderZone.style.zIndex = '';
            }
        });
    });
});
