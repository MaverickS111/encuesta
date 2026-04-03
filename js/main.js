// main.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Navbar Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 2. Intersection Observer for Scroll Animations
    const observerElements = document.querySelectorAll('.fade-up, .fade-in, .slide-up');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    observerElements.forEach(el => observer.observe(el));

    // 3. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // 4. Contact Modal
    const modal      = document.getElementById('contactModal');
    const openBtn    = document.getElementById('openModal');
    const closeBtn   = document.getElementById('closeModal');
    const form       = document.getElementById('contactForm');
    const successMsg = document.getElementById('form-success');

    function openModal() {
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        // Focus first input for accessibility
        setTimeout(() => document.getElementById('nombre').focus(), 200);
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    // Close on overlay click (outside modal card)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    // 5. Form Submission with validation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        // Clear previous errors
        form.querySelectorAll('input').forEach(input => input.classList.remove('input-error'));

        // Validate each required field
        form.querySelectorAll('input[required]').forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('input-error');
                valid = false;
            }
        });

        // Basic email format check
        const emailInput = document.getElementById('email');
        if (emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.classList.add('input-error');
            valid = false;
        }

        if (!valid) return;

        // Deshabilitar botón mientras se envía
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // Recoger datos del formulario
        const payload = {
            nombre:    document.getElementById('nombre').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            telefono:  document.getElementById('telefono').value.trim(),
            email:     document.getElementById('email').value.trim(),
        };

        // Llamada al webhook de n8n
        fetch('https://fgalce.app.n8n.cloud/webhook/a09c9130-8c65-46b6-b56b-0486cfb76210', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            // Mostrar mensaje de éxito
            form.style.display = 'none';
            successMsg.style.display = 'block';
            // Auto-cerrar tras 3 segundos y resetear
            setTimeout(() => {
                closeModal();
                setTimeout(() => {
                    form.style.display = 'flex';
                    successMsg.style.display = 'none';
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar solicitud →';
                }, 400);
            }, 3000);
        })
        .catch(() => {
            // Mostrar error al usuario sin cerrár el modal
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar solicitud →';
            submitBtn.style.background = '#e05c5c';
            submitBtn.textContent = 'Error al enviar. Inténtalo de nuevo.';
            setTimeout(() => {
                submitBtn.style.background = '';
                submitBtn.textContent = 'Enviar solicitud →';
            }, 3000);
        });
    });
});

