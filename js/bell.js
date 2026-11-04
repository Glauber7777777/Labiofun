// Notification Bell Logic
document.addEventListener('DOMContentLoaded', () => {
    // Determine base path based on location
    const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const basePath = isRoot ? './' : '../';

    // Build the bell HTML structure
    const bellContainer = document.createElement('div');
    bellContainer.id = 'notification-bell-container';
    bellContainer.style.position = 'fixed';
    bellContainer.style.bottom = '20px';
    bellContainer.style.right = '20px';
    bellContainer.style.zIndex = '9999';

    bellContainer.innerHTML = `
        <style>
            #notification-bell-container { font-family: 'Inter', sans-serif; }
            .bell-btn { background: var(--gradient-primary, linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)); color: white; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; position: relative; transition: transform 0.3s ease; }
            .bell-btn:hover { transform: scale(1.1); }
            .bell-badge { position: absolute; top: 0; right: 0; background: #e74c3c; color: white; font-size: 12px; font-weight: bold; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
            
            .bell-dialog { position: absolute; bottom: 80px; right: 0; width: 350px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; transform: translateY(20px); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; }
            .bell-dialog.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
            
            .bell-header { padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
            .bell-header h3 { margin: 0; font-size: 16px; color: #1e3c72; display: flex; align-items: center; gap: 8px; }
            .bell-close { background: none; border: none; font-size: 20px; color: #6c757d; cursor: pointer; transition: color 0.2s; }
            .bell-close:hover { color: #e74c3c; }
            
            .bell-body { max-height: 400px; overflow-y: auto; padding: 10px; background: #f8f9fa; }
            
            .bell-item { background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #1e3c72; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: transform 0.2s; cursor: pointer; text-decoration: none; display: block; color: inherit; }
            .bell-item:hover { transform: translateX(5px); }
            .bell-item.seminar { border-left-color: #3498db; }
            .bell-item.defesa { border-left-color: #9b59b6; }
            .bell-item.news { border-left-color: #2ecc71; }
            
            .bell-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .bell-item-type { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6c757d; display: flex; align-items: center; gap: 5px; }
            .bell-item-date { font-size: 11px; color: #6c757d; }
            
            .bell-item-title { font-size: 14px; font-weight: 600; color: #343a40; margin: 0 0 5px 0; line-height: 1.3; }
            .bell-item-desc { font-size: 12px; color: #6c757d; margin: 0; }
            
            /* Responsive */
            @media (max-width: 768px) {
                #notification-bell-container { bottom: 12px !important; right: 12px !important; }
                .bell-btn { width: 44px; height: 44px; font-size: 18px; opacity: .9; }
                .bell-badge { width: 18px; height: 18px; font-size: 10px; top: -4px; right: -4px; }
            }
            @media (max-width: 400px) {
                .bell-dialog { width: 300px; right: -10px; }
            }
        </style>

        <button class="bell-btn" id="bell-toggle">
            <i class="fas fa-bell"></i>
            <span class="bell-badge" id="bell-badge" style="display:none;">0</span>
        </button>

        <div class="bell-dialog" id="bell-dialog">
            <div class="bell-header">
                <h3><i class="fas fa-bell"></i> Notificações</h3>
                <button class="bell-close" id="bell-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="bell-body" id="bell-items-container">
                <!-- Items will be injected here -->
            </div>
        </div>
    `;

    document.body.appendChild(bellContainer);

    // Fetch and populate notifications
    let notifications = [];

    // Next Events from seminarsData
    if (typeof seminarsData !== 'undefined' && seminarsData.length > 0) {
        const baseDate = new Date();
        const futureEvents = seminarsData
            .map(s => {
                const [y, m, d] = s.date.split('-');
                const dt = new Date(y, m - 1, d, 15, 0, 0); // 15:00 local time
                return { ...s, timeObj: dt };
            })
            .filter(s => s.timeObj.getTime() >= baseDate.getTime())
            .sort((a, b) => a.timeObj - b.timeObj);
        
        if (futureEvents.length > 0) {
            // Find the immediate next exam (defense)
            const nextDefesa = futureEvents.find(e => e.type === 'exam');
            if (nextDefesa) {
                notifications.push({
                    type: 'defesa',
                    icon: 'fa-graduation-cap',
                    typeLabel: 'Próxima Defesa',
                    title: nextDefesa.presenter,
                    desc: nextDefesa.title || 'Acompanhe nossa próxima defesa/qualificação.',
                    date: nextDefesa.timeObj.toLocaleDateString('pt-BR'),
                    link: basePath + 'pages/defesas.html'
                });
            }

            // Find the immediate next regular seminar
            const nextSeminar = futureEvents.find(e => e.type === 'regular' || e.type === 'outreach');
            if (nextSeminar) {
                notifications.push({
                    type: 'seminar',
                    icon: 'fa-chalkboard-teacher',
                    typeLabel: 'Próximo Evento',
                    title: nextSeminar.presenter,
                    desc: nextSeminar.title || 'Participe do nosso próximo seminário regular.',
                    date: nextSeminar.timeObj.toLocaleDateString('pt-BR'),
                    link: basePath + 'pages/seminarios.html'
                });
            }
        }
    }

    // Latest News/Publication (Dynamic)
    if (typeof publications !== 'undefined' && publications.length > 0) {
        // Find the newest publication (first in the array or sorting by year)
        // Usually publications is sorted by newest first, but let's just grab the first one
        const latestPub = publications[0];
        notifications.push({
            type: 'news',
            icon: 'fa-book',
            typeLabel: 'Última Publicação',
            title: 'Nova publicação disponível!',
            desc: latestPub.title || 'Acesse nossa aba de publicações para conferir o trabalho mais recente do Labiofun.',
            date: latestPub.year || 'Hoje',
            link: basePath + 'index.html#publications-page'
        });
    } else {
        // Fallback
        notifications.push({
            type: 'news',
            icon: 'fa-newspaper',
            typeLabel: 'Notícia Recente',
            title: 'Novidades no Labiofun!',
            desc: 'Acesse nossa aba de notícias para ler as atualizações mais recentes.',
            date: 'Hoje',
            link: basePath + 'pages/noticias.html'
        });
    }

    // Render items
    const itemsContainer = document.getElementById('bell-items-container');
    const badge = document.getElementById('bell-badge');
    
    if (notifications.length > 0) {
        badge.textContent = notifications.length;
        badge.style.display = 'flex';
    }

    notifications.forEach(n => {
        itemsContainer.innerHTML += `
            <a href="${n.link}" class="bell-item ${n.type}">
                <div class="bell-item-header">
                    <span class="bell-item-type"><i class="fas ${n.icon}"></i> ${n.typeLabel}</span>
                    <span class="bell-item-date">${n.date}</span>
                </div>
                <h4 class="bell-item-title">${n.title}</h4>
                <p class="bell-item-desc">${n.desc}</p>
            </a>
        `;
    });

    // Toggle logic
    const btn = document.getElementById('bell-toggle');
    const dialog = document.getElementById('bell-dialog');
    const closeBtn = document.getElementById('bell-close');

    // Load read state from localStorage
    const hasReadNotifs = localStorage.getItem('labiofun_notifs_read');
    if (hasReadNotifs === 'true') {
        badge.style.display = 'none';
    }

    btn.addEventListener('click', () => {
        dialog.classList.toggle('open');
        badge.style.display = 'none'; // mark as read
        localStorage.setItem('labiofun_notifs_read', 'true');
    });

    closeBtn.addEventListener('click', () => {
        dialog.classList.remove('open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!bellContainer.contains(e.target) && dialog.classList.contains('open')) {
            dialog.classList.remove('open');
        }
    });
});
