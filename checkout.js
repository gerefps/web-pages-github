document.addEventListener('DOMContentLoaded', () => {
    // Add checkout.js to upgrade.html later or assume the buttons have these IDs
    const btnNormal = document.getElementById('btn-assinar-normal') || document.querySelector('.btn-normal');
    const btnPro = document.getElementById('btn-assinar-pro') || document.querySelector('.btn-pro');

    async function handleCheckout(plan, buttonElement) {
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = 'Conectando ao Mercado Pago...';
        buttonElement.style.opacity = '0.7';
        buttonElement.style.pointerEvents = 'none';

        try {
            const token = await getAuthToken();
            if (!token) {
                window.location.href = '/login.html?redirect=upgrade.html';
                return;
            }

            const res = await fetch(`/api/checkout/${plan}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (data.init_point) {
                window.location.href = data.init_point; // Redirects to Mercado Pago
            } else {
                alert("Erro ao iniciar o checkout: " + (data.error || "Tente novamente mais tarde."));
                buttonElement.innerHTML = originalText;
                buttonElement.style.opacity = '1';
                buttonElement.style.pointerEvents = 'auto';
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Ocorreu um erro ao conectar com o Mercado Pago.");
            buttonElement.innerHTML = originalText;
            buttonElement.style.opacity = '1';
            buttonElement.style.pointerEvents = 'auto';
        }
    }

    if (btnNormal) {
        btnNormal.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout('normal', btnNormal);
        });
    }

    if (btnPro) {
        btnPro.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout('pro', btnPro);
        });
    }
});
