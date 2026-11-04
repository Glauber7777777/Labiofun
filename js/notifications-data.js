/**
 * Labiofun - Dados do Sistema de Notificações (Dinâmico)
 * Constrói notificações automaticamente baseando-se em:
 * - Última publicação (publications-data.js)
 * - Próximo seminário/defesa (seminarios-data.js)
 */

let notificationsData = [];

const baseDate = new Date();

// 1. Última Publicação
if (typeof publications !== 'undefined' && publications.length > 0) {
    const latestPub = publications[0];
    notificationsData.push({
        id: `pub_${latestPub.doi || 'latest'}`,
        type: "publicacao",
        title: "Última Publicação",
        message: `<em>${latestPub.title}</em><br><small>${latestPub.journal} (${latestPub.year})</small>`,
        time: "Novo",
        link: "index.html#publications-page"
    });
}

// 2. Próxima Defesa (type === 'exam')
if (typeof seminarsData !== 'undefined' && seminarsData.length > 0) {
    const futureEvents = seminarsData
        .map(s => {
            const d = new Date(s.date);
            d.setHours(15, 0, 0, 0);
            return { ...s, timeObj: d };
        })
        .filter(s => s.timeObj.getTime() >= baseDate.getTime())
        .sort((a, b) => a.timeObj - b.timeObj);

    // Next defense
    const nextDefesa = futureEvents.find(e => e.type === 'exam');
    if (nextDefesa) {
        const day = nextDefesa.timeObj.getDate();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const formattedDate = `${day} de ${monthNames[nextDefesa.timeObj.getMonth()]}`;
        let typeLabel = 'Defesa';
        if (nextDefesa.titleKey && nextDefesa.titleKey.includes('tcc')) typeLabel = 'Defesa de TCC';
        if (nextDefesa.titleKey && nextDefesa.titleKey.includes('masters')) typeLabel = 'Defesa de Mestrado';
        if (nextDefesa.titleKey && nextDefesa.titleKey.includes('admission')) typeLabel = 'Exame de Qualificação';

        notificationsData.push({
            id: `def_${nextDefesa.id}`,
            type: "evento",
            title: `Próxima ${typeLabel}`,
            message: `<strong>${nextDefesa.presenter}</strong><br>${nextDefesa.title ? `<em>${nextDefesa.title}</em><br>` : ''}Agendado para: ${formattedDate}`,
            time: "Em breve",
            link: "pages/defesas.html"
        });
    }

    // Next regular seminar or outreach
    const nextSeminar = futureEvents.find(e => e.type === 'regular' || e.type === 'outreach');
    if (nextSeminar) {
        const day = nextSeminar.timeObj.getDate();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const formattedDate = `${day} de ${monthNames[nextSeminar.timeObj.getMonth()]}`;
        const titleText = nextSeminar.title || `Seminário com ${nextSeminar.presenter}`;

        notificationsData.push({
            id: `sem_${nextSeminar.id}`,
            type: "evento",
            title: "Próximo Evento",
            message: `<strong>${titleText}</strong><br>Com ${nextSeminar.presenter}<br>Marcado para: ${formattedDate}`,
            time: "Em breve",
            link: "pages/seminarios.html"
        });
    }
}
