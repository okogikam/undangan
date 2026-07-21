document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SYSTEM INITIALIZATION & STATE
    // ==========================================
    const state = {
        isMusicPlaying: false,
        theme: localStorage.getItem('theme') || 'light'
    };

    // DOM Elements
    const dom = {
        loadingScreen: document.getElementById('loading-screen'),
        btnOpenInvitation: document.getElementById('btn-open-invitation'),
        mainContent: document.getElementById('main-content'),
        music: document.getElementById('wedding-music'),
        musicCtrl: document.getElementById('music-control'),
        backToTop: document.getElementById('back-to-top'),
        floatingActions: document.getElementById('floating-actions'),
        navbar: document.getElementById('navbar'),
        scrollBar: document.getElementById('scroll-bar'),
        menuToggle: document.querySelector('.menu-toggle'),
        navLinks: document.querySelector('.nav-links'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        rsvpForm: document.getElementById('rsvp-form'),
        wishesList: document.getElementById('wishes-list'),
        // lightbox: document.getElementById('lightbox'),
        // lightboxImg: document.querySelector('.lightbox-content'),
        // lightboxClose: document.querySelector('.lightbox-close')
    };

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', state.theme);
    dom.darkModeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';

    // ==========================================
    // 2. LOADING SCREEN CONTROL
    // ==========================================
    window.addEventListener('load', () => {
        setTimeout(() => {
            dom.loadingScreen.style.opacity = '0';
            setTimeout(() => dom.loadingScreen.classList.add('hidden'), 800);
        }, 1500); // Garansi transisi visual halus
    });

    // ==========================================
    // 3. MAIN CORE TRIGGER (BUKA UNDANGAN)
    // ==========================================
    dom.btnOpenInvitation.addEventListener('click', () => {
        dom.mainContent.classList.remove('hidden');
        dom.floatingActions.classList.remove('hidden');
        
        // Play Audio safely
        playAudio();
        
        // Lazy Load Init
        initLazyLoading();

        // Scroll ke Element pertama pasca hero
        document.getElementById('quotes').scrollIntoView({ behavior: 'smooth' });
    });

    function playAudio() {
        dom.music.play().then(() => {
            state.isMusicPlaying = true;
            dom.musicCtrl.textContent = '🎵';
        }).catch(err => console.log("Audio playback auto-blocked by browser policy. User action required."));
    }

    dom.musicCtrl.addEventListener('click', () => {
        if (state.isMusicPlaying) {
            dom.music.pause();
            dom.musicCtrl.textContent = '🔇';
        } else {
            dom.music.play();
            dom.musicCtrl.textContent = '🎵';
        }
        state.isMusicPlaying = !state.isMusicPlaying;
    });

    // ==========================================
    // 4. ANIMATION & SCROLL MANAGEMENT
    // ==========================================
    
    // Smooth Scroll Progress & Navbar Dynamic State
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        dom.scrollBar.style.width = scrolled + "%";

        // Navbar visibility state
        if (winScroll > 50) {
            dom.navbar.classList.add('scrolled');
        } else {
            dom.navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (winScroll > 400) {
            dom.backToTop.classList.remove('hidden');
        } else {
            dom.backToTop.classList.add('hidden');
        }
    });

    dom.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Intersection Observer untuk memicu animasi masuk komponen
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-reveal').forEach(el => scrollObserver.observe(el));

    // ==========================================
    // 5. RESPONSIVE MOBILE MENU
    // ==========================================
    dom.menuToggle.addEventListener('click', () => {
        const expanded = dom.menuToggle.getAttribute('aria-expanded') === 'true';
        dom.menuToggle.setAttribute('aria-expanded', !expanded);
        dom.navLinks.classList.toggle('active');
    });

    // Menutup menu nav ketika salah satu link diklik di mobile
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            dom.navLinks.classList.remove('active');
            dom.menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // ==========================================
    // 6. COUNTDOWN CORE TIMER
    // ==========================================
    const timerElement = document.getElementById('timer');
    const targetDate = new Date(timerElement.dataset.date).getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            clearInterval(countdownInterval);
            timerElement.innerHTML = "<p>Acara Sedang Berlangsung!</p>";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    };

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

    // ==========================================
    // 7. LIGHTBOX & MASONRY GALLERY SYSTEM
    // ==========================================
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').getAttribute('src');
            dom.lightboxImg.setAttribute('src', imgSrc);
            dom.lightbox.style.display = 'flex';
            dom.lightbox.setAttribute('aria-hidden', 'false');
        });
    });

    // const closeLightbox = () => {
    //     dom.lightbox.style.display = 'none';
    //     dom.lightbox.setAttribute('aria-hidden', 'true');
    // };

    // dom.lightboxClose.addEventListener('click', closeLightbox);
    // dom.lightbox.addEventListener('click', (e) => {
    //     if(e.target === dom.lightbox) closeLightbox();
    // });

    // ==========================================
    // 8. LAZY LOADING COMPONENT
    // ==========================================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy, iframe.lazy');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.remove('lazy');
                        imageObserver.unobserve(image);
                    }
                });
            });
            lazyImages.forEach(image => imageObserver.observe(image));
        } else {
            // Fallback untuk browser lawas
            lazyImages.forEach(image => image.src = image.dataset.src);
        }
    }

    // ==========================================
    // 9. LOCAL STORAGE PERSISTENCE (RSVP & WISHES)
    // ==========================================
    const loadWishes = () => {
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [
            { name: "Budi Santoso", status: "hadir", message: "Selamat menempuh hidup baru Rama dan Sinta! Bahagia dunia akhirat." },
            { name: "Siti Rahma", status: "tidak-hadir", message: "Selamat ya! Maaf belum bisa hadir langsung karena dinas luar kota, sukses acaranya!" }
        ];

        dom.wishesList.innerHTML = wishes.map(wish => `
            <div class="card card-wish scroll-reveal active">
                <div class="wish-header">
                    <span class="wish-name">${escapeHTML(wish.name)}</span>
                    <span class="wish-status ${wish.status === 'hadir' ? 'status-hadir' : 'status-tidak'}">
                        ${wish.status === 'hadir' ? 'Hadir' : 'Absen'}
                    </span>
                </div>
                <p class="wish-text">${escapeHTML(wish.message)}</p>
            </div>
        `).join('');
    };

    dom.rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newWish = {
            name: document.getElementById('rsvp-name').value,
            guests: document.getElementById('rsvp-guests').value,
            status: document.getElementById('rsvp-status').value,
            message: document.getElementById('rsvp-message').value
        };

        const currentWishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
        currentWishes.unshift(newWish); // Tambah data ke antrean teratas
        localStorage.setItem('wedding_wishes', JSON.stringify(currentWishes));

        dom.rsvpForm.reset();
        loadWishes();
        alert('Terima kasih atas konfirmasi dan doa restu Anda!');
    });

    // Helper Utility: XSS Protection Injection Mitigation
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    loadWishes();

    // ==========================================
    // 10. SYSTEM UTILITIES (COPY TO CLIPBOARD & THEME)
    // ==========================================
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const textToCopy = document.getElementById(targetId).textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.textContent;
                btn.textContent = 'Tersalin!';
                setTimeout(() => btn.textContent = originalText, 2000);
            });
        });
    });

    dom.darkModeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
        dom.darkModeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    });

    // ==========================================
    // 11. MATERIAL RIPPLE EFFECT
    // ==========================================
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.style.position = 'absolute';
            ripples.style.transform = 'translate(-50%, -50%)';
            ripples.style.pointerEvents = 'none';
            ripples.style.borderRadius = '50%';
            ripples.style.width = '0px';
            ripples.style.height = '0px';
            ripples.style.background = 'rgba(255,255,255, 0.4)';
            ripples.style.animation = 'rippleAnim 0.6s linear';
            
            if(this.classList.contains('btn-outline')) {
                ripples.style.background = 'rgba(200, 169, 106, 0.3)';
            }
            
            this.appendChild(ripples);
            setTimeout(() => ripples.remove(), 600);
        });
    });
});