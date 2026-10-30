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

    const container = document.getElementById('overlayContainer');
    // Force exact 1080x1350 bounds on container
    container.style.width = '1080px';
    container.style.height = '1350px';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.margin = '0';
    container.style.padding = '0';
    container.style.backgroundColor = 'transparent';
    
    // Inject custom styles that match instagram.css and PRO post
    const customProStyles = document.createElement('style');
    customProStyles.innerHTML = `
        .pro-photo-header-large { display: flex; align-items: center; justify-content: center; gap: 40px; position: relative; z-index: 3; margin-bottom: 15px; width: 100%; }
        .pro-photo-large { width: 170px; height: 170px; border-radius: 50%; object-fit: cover; border: 8px solid var(--neon-blue); box-shadow: 0 0 80px rgba(0, 210, 255, 0.7); }
        .pro-info-large { display: flex; flex-direction: column; align-items: flex-start; }
        .pro-subtitle-large { font-family: 'Inter', sans-serif; font-size: 28px; color: var(--neon-blue); font-weight: 800; letter-spacing: 12px; text-transform: uppercase; text-shadow: 0 0 15px rgba(0, 210, 255, 0.6); margin-bottom: 0px; }
        .pro-name-large { font-family: 'Teko', sans-serif; font-size: 115px; color: white; line-height: 0.95; text-transform: uppercase; text-shadow: 0 15px 30px rgba(0,0,0,0.9); margin-top: 5px; }
        .detailed-info-row { display: flex; width: 100%; gap: 15px; margin-top: 20px; z-index: 3; position: relative; }
        .detailed-box { background: rgba(5, 12, 25, 0.85); border: 1px solid var(--neon-blue); border-radius: 6px; padding: 15px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: inset 0 0 15px rgba(0, 210, 255, 0.1), 0 0 15px rgba(0,0,0,0.5); }
        .detailed-box-full { width: 100%; }
        .detailed-box-label { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--neon-blue); font-weight: 800; letter-spacing: 2px; margin-bottom: 5px; }
        .detailed-box-value { font-family: 'Teko', sans-serif; font-size: 38px; color: #fff; font-weight: 600; line-height: 1; text-transform: uppercase; text-shadow: 0 0 10px rgba(0,210,255,0.3); }
        .detailed-weapon-img-wrapper { width: 100%; position: relative; z-index: 2; filter: drop-shadow(0 0 25px rgba(0,210,255,0.4)); }
        .detailed-weapon-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .detailed-attachments-container { width: 100%; display: flex; flex-direction: column; z-index: 3; position: relative; }
        .detailed-attachment { display: flex; justify-content: space-between; align-items: center; padding: 12px 25px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.4); }
        .detailed-att-type { font-family: 'Inter', sans-serif; font-size: 16px; color: var(--neon-blue); font-weight: 800; letter-spacing: 2px; }
        .detailed-att-name { font-family: 'Teko', sans-serif; font-size: 32px; color: #fff; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; }
        
        .weapon-card-wrapper {
            position: absolute; top: 0; left: 0; width: 1080px; height: 1350px;
            opacity: 0; transform: translateY(50px) scale(0.95);
            transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        }
        .weapon-card-wrapper.active {
            opacity: 1; transform: translateY(0) scale(1);
        }
    `;
    document.head.appendChild(customProStyles);

    const evtSource = new EventSource('/api/sync' + window.location.search);

    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.settings && data.settings.brandColor) {
            document.documentElement.style.setProperty('--brand-color', `#${data.settings.brandColor}`);
            document.documentElement.style.setProperty('--neon-blue', `#${data.settings.brandColor}`);
        }
        
        if (data.action === 'show' && data.weapon) {
            const w = data.weapon;
            
            let attachmentsHTML = '';
            if (w.attachments) {
                const attKeys = Object.keys(w.attachments);
                for (let i=0; i<Math.min(5, attKeys.length); i++) {
                    const typeKey = attKeys[i];
                    const att = w.attachments[typeKey];
                    const attName = (typeof att === 'object' && att.name) ? att.name : (typeof att === 'string' ? att : '');
                    attachmentsHTML += `
                        <div class="detailed-attachment">
                            <div class="detailed-att-type">${typeKey.toUpperCase()}</div>
                            <div class="detailed-att-name">${attName}</div>
                        </div>
                    `;
                }
            }

            const codeText = (w.code && w.code.trim() !== '') ? w.code : 'N/A';
            const categoryText = 'PRO LOADOUT'; // Você pode mapear playstyle se existir

            // O background da carta é a foto do criador com blur pesado e sobreposição escura
            const bgUrl = w.photoUrl || w.image || '';

            const cardHTML = `
                <div class="weapon-card-wrapper">
                    <!-- Fundo Desfocado -->
                    <div style="position:absolute;top:-20px;left:-20px;right:-20px;bottom:-20px;width:calc(100% + 40px);height:calc(100% + 40px);z-index:0;background:url('${bgUrl}') center/cover no-repeat; filter:blur(15px); opacity:0.6;"></div>
                    
                    <!-- Gradiente de Escurecimento -->
                    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,5,15,0.85) 100%);z-index:1;"></div>
                    
                    <!-- Conteúdo Principal -->
                    <div style="display:flex; flex-direction:column; height:100%; position:relative; z-index:2; box-sizing:border-box; align-items:center; padding: 50px 40px 30px;">
                        
                        <!-- Cabeçalho do PRO -->
                        <div class="pro-photo-header-large">
                            <div class="pro-photo-large" style="background:url('${bgUrl}') center 20% / cover no-repeat;"></div>
                            <div class="pro-info-large">
                                <div class="pro-subtitle-large">CLASSES EXCLUSIVAS</div>
                                <div class="pro-name-large">${w.proName || 'PRO'}</div>
                            </div>
                        </div>

                        <!-- Título da Arma -->
                        <div style="font-family:'Teko',sans-serif; font-size:110px; font-weight:700; color:#fff; text-transform:uppercase; line-height:1; text-shadow: 0 10px 20px rgba(0,0,0,0.7); margin-bottom: 10px;">
                            ${w.name}
                        </div>
                        
                        <!-- Categoria -->
                        <div class="detailed-info-row" style="margin-top:0; justify-content:center; margin-bottom: 10px;">
                            <div class="detailed-box detailed-box-full" style="padding: 10px 50px;">
                                <div class="detailed-box-label">CATEGORIA</div>
                                <div class="detailed-box-value">${categoryText}</div>
                            </div>
                        </div>

                        <!-- Imagem da Arma -->
                        <div class="detailed-weapon-img-wrapper" style="height:250px; display:flex; align-items:center; justify-content:center; margin-bottom: 15px;">
                            ${w.image ? `<img src="${w.image}" class="detailed-weapon-img" />` : '<div style="color:#555;font-size:24px;">SEM IMAGEM</div>'}
                        </div>

                        <!-- Acessórios (Até 5) -->
                        <div class="detailed-attachments-container" style="gap: 15px; margin-bottom: 20px;">
                            ${attachmentsHTML}
                        </div>

                        <!-- Código de Classe -->
                        <div class="detailed-info-row" style="margin-top: auto; justify-content:center;">
                            <div class="detailed-box detailed-box-full" style="width: 85%;">
                                <div class="detailed-box-label">CÓDIGO DE CLASSE</div>
                                <div class="detailed-box-value">${codeText}</div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="margin-top: auto; width: 100%; border-top: 1px solid rgba(0,210,255,0.2); padding-top: 18px; padding-bottom: 18px; display: flex; align-items: center; justify-content: center; gap: 12px;">
                            <div style="width: 5px; height: 5px; background: #00d2ff; border-radius: 50%; box-shadow: 0 0 8px #00d2ff;"></div>
                            <span style="font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: rgba(255,255,255,0.9); letter-spacing: 1px; text-transform: uppercase;">warzonebrmetas.com.br</span>
                            <div style="width: 5px; height: 5px; background: #00d2ff; border-radius: 50%; box-shadow: 0 0 8px #00d2ff;"></div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = cardHTML;

            requestAnimationFrame(() => {
                setTimeout(() => {
                    const card = container.querySelector('.weapon-card-wrapper');
                    if(card) card.classList.add('active');
                }, 50);
            });

        } else if (data.action === 'hide') {
            const card = container.querySelector('.weapon-card-wrapper');
            if(card) card.classList.remove('active');
        }
    };
});
