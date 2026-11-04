// ============================================================================
// Bento Gallery Data
// NOTE: Paths are relative to pages/gallery.html
// ============================================================================
const galleryMediaItems = [
    {
        id: 1,
        type: "image",
        title: "Microscopia Eletrônica",
        desc: "Imagem de microscopia eletrônica de varredura",
        url: "../Gallery/IMG_0116.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 2,
        type: "video",
        title: "Experimento em Vídeo",
        desc: "Registro de experimento no laboratório",
        url: "../Gallery/gallery-video-2.mp4",
        span: "col-span-2 row-span-4"
    },
    {
        id: 3,
        type: "image",
        title: "Estruturas Fúngicas",
        desc: "Visualização de estruturas fúngicas",
        url: "../Gallery/IMG_1091.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 4,
        type: "image",
        title: "Análise Microscópica",
        desc: "Análise detalhada ao microscópio",
        url: "../Gallery/IMG_1181.webp",
        span: "col-span-2 row-span-3"
    },
    {
        id: 5,
        type: "image",
        title: "Cultura Celular",
        desc: "Cultura celular em laboratório",
        url: "../Gallery/IMG_1189.webp",
        span: "col-span-1 row-span-4"
    },
    {
        id: 6,
        type: "image",
        title: "Equipamento de Pesquisa",
        desc: "Equipamentos utilizados na pesquisa",
        url: "../Gallery/IMG_1323.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 7,
        type: "image",
        title: "Amostras Biológicas",
        desc: "Preparação de amostras biológicas",
        url: "../Gallery/IMG_1327.webp",
        span: "col-span-2 row-span-4"
    },
    {
        id: 8,
        type: "image",
        title: "Coloração Celular",
        desc: "Técnica de coloração celular",
        url: "../Gallery/IMG_1413.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 9,
        type: "image",
        title: "Experimento in vitro",
        desc: "Experimento in vitro com fungos",
        url: "../Gallery/IMG_1618.webp",
        span: "col-span-2 row-span-3"
    },
    {
        id: 10,
        type: "image",
        title: "Observação Laboratorial",
        desc: "Observação no laboratório",
        url: "../Gallery/IMG_1620.webp",
        span: "col-span-1 row-span-4"
    },
    {
        id: 11,
        type: "image",
        title: "Biofilme",
        desc: "Formação de biofilme fúngico",
        url: "../Gallery/IMG_1976.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 12,
        type: "image",
        title: "Microscopia de Fluorescência",
        desc: "Imagem de fluorescência",
        url: "../Gallery/IMG_1977.webp",
        span: "col-span-2 row-span-4"
    },
    {
        id: 13,
        type: "image",
        title: "Pesquisa em Andamento",
        desc: "Atividade de pesquisa laboratorial",
        url: "../Gallery/IMG_2006.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 14,
        type: "image",
        title: "Análise de Dados",
        desc: "Processamento de dados experimentais",
        url: "../Gallery/IMG_2077.webp",
        span: "col-span-2 row-span-3"
    },
    {
        id: 15,
        type: "image",
        title: "Técnicas Biofísicas",
        desc: "Aplicação de técnicas biofísicas",
        url: "../Gallery/IMG_2080.webp",
        span: "col-span-1 row-span-4"
    },
    {
        id: 16,
        type: "image",
        title: "Cultura em Placa",
        desc: "Cultura de microrganismos em placa",
        url: "../Gallery/IMG_2091.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 17,
        type: "image",
        title: "Espectroscopia",
        desc: "Análise espectroscópica",
        url: "../Gallery/IMG_2102.webp",
        span: "col-span-2 row-span-4"
    },
    {
        id: 18,
        type: "image",
        title: "Trabalho de Campo",
        desc: "Coleta de amostras",
        url: "../Gallery/IMG_2282.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 19,
        type: "image",
        title: "Preparação de Reagentes",
        desc: "Preparação de soluções e reagentes",
        url: "../Gallery/IMG_3005.webp",
        span: "col-span-2 row-span-3"
    },
    {
        id: 20,
        type: "image",
        title: "Observação ao Microscópio",
        desc: "Análise microscópica detalhada",
        url: "../Gallery/IMG_3044.webp",
        span: "col-span-1 row-span-4"
    },
    {
        id: 21,
        type: "image",
        title: "Resultado Experimental",
        desc: "Resultado de experimento",
        url: "../Gallery/IMG_3050.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 22,
        type: "image",
        title: "Estrutura Celular",
        desc: "Visualização de estrutura celular",
        url: "../Gallery/IMG_3053.webp",
        span: "col-span-2 row-span-4"
    },
    {
        id: 23,
        type: "image",
        title: "Amostra Biológica",
        desc: "Preparação de amostra biológica",
        url: "../Gallery/IMG_3059.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 24,
        type: "image",
        title: "Análise Morfológica",
        desc: "Estudo morfológico de fungos",
        url: "../Gallery/IMG_3765.webp",
        span: "col-span-2 row-span-3"
    },
    {
        id: 25,
        type: "image",
        title: "Pesquisa Avançada",
        desc: "Técnicas avançadas de pesquisa",
        url: "../Gallery/IMG_3843.webp",
        span: "col-span-1 row-span-4"
    },
    {
        id: 26,
        type: "image",
        title: "Equipamento Científico",
        desc: "Equipamento de última geração",
        url: "../Gallery/IMG_4922.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 27,
        type: "image",
        title: "Interação Celular",
        desc: "Interação entre células",
        url: "../Gallery/IMG_5507.webp",
        span: "col-span-2 row-span-4"
    },
    {
        id: 28,
        type: "image",
        title: "Pinça Óptica",
        desc: "Medição com pinça óptica",
        url: "../Gallery/IMG_7132.webp",
        span: "col-span-1 row-span-3"
    },
    {
        id: 29,
        type: "image",
        title: "Colônia Fúngica",
        desc: "Crescimento de colônia fúngica",
        url: "../Gallery/IMG_7239.webp",
        span: "col-span-2 row-span-3"
    },
    {
        id: 30,
        type: "image",
        title: "Laboratório em Ação",
        desc: "Atividades diárias no laboratório",
        url: "../Gallery/IMG_8422.webp",
        span: "col-span-1 row-span-4"
    },
    {
        id: 31,
        type: "image",
        title: "Imagem MEV",
        desc: "Microscopia Eletrônica de Varredura",
        url: "../Gallery/IMG_8430.webp",
        span: "col-span-2 row-span-4"
    },
    {
        id: 32,
        type: "image",
        title: "Análise Biofísica",
        desc: "Experimento de biofísica",
        url: "../Gallery/IMG_0940.webp",
        span: "col-span-1 row-span-3"
    }
];

// ============================================================================
// Bento Gallery Logic
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('bento-grid');
    if (!gridContainer) return;

    let selectedItem = null;

    // --- Render Grid ---
    function renderGrid() {
        gridContainer.innerHTML = '';
        galleryMediaItems.forEach((item, index) => {
            const cell = document.createElement('div');
            cell.className = `bento-cell ${item.span}`;
            cell.style.animationDelay = `${index * 0.05}s`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-label', item.title);

            if (item.type === 'video') {
                cell.innerHTML = `
                    <div class="bento-bg-blur" style="background: #111;"></div>
                    <video class="bento-media" muted loop playsinline preload="metadata">
                        <source src="${item.url}" type="video/mp4">
                    </video>
                    <div class="bento-overlay">
                        <div class="bento-play-icon"><i class="fas fa-play"></i></div>
                        <div class="bento-info">
                            <h3>${item.title}</h3>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                `;
            } else {
                cell.innerHTML = `
                    <div class="bento-bg-blur" style="background-image: url('${item.url}')"></div>
                    <img class="bento-media" src="${item.url}" alt="${item.title}" loading="lazy" decoding="async">
                    <div class="bento-overlay">
                        <div class="bento-info">
                            <h3>${item.title}</h3>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                `;
            }

            cell.addEventListener('click', () => openModal(item));
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(item);
                }
            });

            gridContainer.appendChild(cell);
        });

        // Video auto-play on viewport intersection
        setupVideoAutoplay();
    }

    // --- Video Autoplay via IntersectionObserver ---
    function setupVideoAutoplay() {
        const videos = gridContainer.querySelectorAll('video');
        if (!videos.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });

        videos.forEach(v => observer.observe(v));
    }

    // --- Modal Logic ---
    function openModal(item) {
        selectedItem = item;
        const modal = document.getElementById('gallery-modal');
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        updateModalContent(item);
        renderDock(item);
    }

    function closeModal() {
        const modal = document.getElementById('gallery-modal');
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Pause any modal video
        const modalVideo = modal.querySelector('.modal-media-container video');
        if (modalVideo) modalVideo.pause();

        selectedItem = null;
    }

    function updateModalContent(item) {
        const container = document.querySelector('.modal-media-container');
        if (!container) return;

        // Fade out
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px) scale(0.97)';

        setTimeout(() => {
            if (item.type === 'video') {
                container.innerHTML = `
                    <video class="modal-media" controls autoplay playsinline>
                        <source src="${item.url}" type="video/mp4">
                    </video>
                `;
            } else {
                container.innerHTML = `
                    <img class="modal-media" src="${item.url}" alt="${item.title}">
                `;
            }

            // Caption
            const caption = document.querySelector('.modal-caption');
            if (caption) {
                caption.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p>`;
            }

            // Fade in
            requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0) scale(1)';
            });
        }, 150);
    }

    function renderDock(activeItem) {
        const dock = document.querySelector('.modal-dock-items');
        if (!dock) return;

        dock.innerHTML = '';
        galleryMediaItems.forEach((item, index) => {
            const thumb = document.createElement('div');
            thumb.className = `dock-thumb ${activeItem.id === item.id ? 'active' : ''}`;
            thumb.style.setProperty('--rotate', `${index % 2 === 0 ? -15 : 15}deg`);

            if (item.type === 'video') {
                thumb.innerHTML = `<video src="${item.url}" muted preload="metadata"></video><div class="dock-thumb-overlay"></div>`;
            } else {
                thumb.innerHTML = `<img src="${item.url}" alt="${item.title}" loading="lazy" decoding="async"><div class="dock-thumb-overlay"></div>`;
            }

            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedItem = item;
                updateModalContent(item);
                // Update active state
                dock.querySelectorAll('.dock-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });

            dock.appendChild(thumb);
        });
    }

    // --- Event Listeners ---
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modalOverlay = document.getElementById('gallery-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay || e.target.closest('.modal-media-container')) {
                // Don't close when clicking the media itself
            }
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && selectedItem) closeModal();
        if (!selectedItem) return;
        
        const currentIndex = galleryMediaItems.findIndex(i => i.id === selectedItem.id);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            const next = galleryMediaItems[(currentIndex + 1) % galleryMediaItems.length];
            selectedItem = next;
            updateModalContent(next);
            const dock = document.querySelector('.modal-dock-items');
            if (dock) {
                dock.querySelectorAll('.dock-thumb').forEach(t => t.classList.remove('active'));
                dock.children[(currentIndex + 1) % galleryMediaItems.length]?.classList.add('active');
            }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            const prev = galleryMediaItems[(currentIndex - 1 + galleryMediaItems.length) % galleryMediaItems.length];
            selectedItem = prev;
            updateModalContent(prev);
            const dock = document.querySelector('.modal-dock-items');
            if (dock) {
                dock.querySelectorAll('.dock-thumb').forEach(t => t.classList.remove('active'));
                dock.children[(currentIndex - 1 + galleryMediaItems.length) % galleryMediaItems.length]?.classList.add('active');
            }
        }
    });

    // Render on load
    renderGrid();
});
