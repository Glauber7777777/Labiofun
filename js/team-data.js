// Dados da Equipe Atual
const currentTeam = [
    {
        name: "Susana Frases Carvajal",
        image: "images/Susana.webp",
        roleKey: "member.susana.role",
        roleDefault: "Professora - Ph.D",
        titleKey: "member.susana.title",
        titleDefault: "Chefe do laboratório",
        bioKey: "member.susana.bio",
        bioDefault: "Bióloga (<em>Universidad Miguel Hernández</em>, Espanha), especialista em biofísica de superfícies fúngicas e na complexa interação patógeno-hospedeiro, com ênfase em mecanismos de virulência, resistência antimicrobiana, impacto ecossistêmico e mudanças climáticas, além da prospecção de compostos bioativos para aplicações biotecnológicas e terapêuticas.",
        links: [
            { url: "http://lattes.cnpq.br/2411558438385429", icon: "fas fa-file-lines", title: "Currículo Lattes" },
            { url: "https://orcid.org/0000-0001-5875-9886", icon: "fab fa-orcid", title: "ORCID" }
        ],
        category: "Professores"
    },
    {
        name: "Christina Maeda Takiya",
        image: "images/Takiya.webp",
        roleKey: "member.takiya.role",
        roleDefault: "Professora - M.D & Ph.D",
        bioKey: "member.takiya.bio",
        bioDefault: "Médica patologista (UFRJ), especialista em morfologia e anatomia patológica, destacando-se em patologia renal, cardiovascular e pulmonar, com foco em matriz extracelular, reparo e regeneração tecidual, terapias celulares e bioengenharia.",
        links: [
            { url: "http://lattes.cnpq.br/1606566838418875", icon: "fas fa-file-lines", title: "Currículo Lattes" },
            { url: "https://orcid.org/0000-0002-8019-628X", icon: "fab fa-orcid", title: "ORCID" }
        ],
        category: "Professores"
    },
    {
        name: "Dario Corrêa-Junior",
        image: "images/Dario.webp",
        roleKey: "member.dario.role",
        roleDefault: "Pós-doutor - M.Sc & Ph.D",
        bioKey: "member.dario.bio",
        bioDefault: "Biólogo (UFMS), especialista na área de microbiologia, com ênfase em micologia e ensino de biociências aplicadas à saúde, com foco em mecanismos de virulência, resistência antimicrobiana e impacto ecossistêmico, integrando pesquisa avançada e práticas educacionais para promover o conhecimento científico e a saúde pública e única (<em>One Health</em>).",
        links: [
            { url: "http://lattes.cnpq.br/2857080301590305", icon: "fas fa-file-lines", title: "Currículo Lattes" },
            { url: "https://orcid.org/0000-0003-2821-4978", icon: "fab fa-orcid", title: "ORCID" }
        ],
        category: "Pós-doutores"
    },
    {
        name: "Glauber R. S. Araujo",
        image: "images/Glauber.webp",
        roleKey: "role.postdoc",
        roleDefault: "Pós-doutor - M.Sc & Ph.D",
        bioKey: "member.glauber.bio",
        bioDefault: "<em>Alma mater</em> em biofísica (UFRJ), com foco na caracterização estrutural e mecânica de superfícies fúngicas. Experiência avançada na aplicação de técnicas <em>cutting edge</em> incluindo espalhamento de luz, análise viscoelástica, microscopia óptica e eletrônica para elucidar a arquitetura molecular, propriedades mecânicas e interações físico-químicas em micro e nanoescala.",
        links: [
            { url: "http://lattes.cnpq.br/8718259166854318", icon: "fas fa-file-lines", title: "Currículo Lattes" },
            { url: "https://orcid.org/0000-0002-5478-9006", icon: "fab fa-orcid", title: "ORCID" }
        ],
        category: "Pós-doutores"
    },
    {
        name: "Juliana Britto",
        image: "images/Juliana.webp",
        roleKey: "role.phd",
        roleDefault: "Doutoranda - M. Sc.",
        bioKey: "member.juliana.bio",
        bioDefault: "Bióloga, seu foco são os estudos sobre mecanismos de virulência, resistência antimicrobiana e impacto ecossistêmico, com foco na compreensão dos processos biológicos que influenciam a patogenicidade microbiana e suas consequências ambientais em ecossistemas de manguezais.",
        links: [
            { url: "http://lattes.cnpq.br/0156560802723111", icon: "fas fa-file-lines", title: "Currículo Lattes" },
            { url: "https://orcid.org/0000-0002-0986-1072", icon: "fab fa-orcid", title: "ORCID" }
        ],
        category: "Doutorandos"
    },
    {
        name: "Mariana Brito Barbieri",
        image: "images/Mariana.webp",
        roleKey: "role.masters",
        roleDefault: "Mestranda",
        bioKey: "member.mariana.bio",
        bioDefault: "Biotecnologista (UFRJ), seu foco é a caracterização detalhada da diversidade fúngica associada à degradação das sementes de andiroba, com foco na elucidação das interações microbianas envolvidas no processo tradicional de extração do óleo.",
        links: [
            { url: "http://lattes.cnpq.br/1866435864910830", icon: "fas fa-file-lines", title: "Currículo Lattes" },
            { url: "https://orcid.org/0009-0007-3571-554X", icon: "fab fa-orcid", title: "ORCID" }
        ],
        category: "Mestrandos"
    },
    {
        name: "Thais de Melo Moreira",
        image: "images/Thais.webp",
        roleKey: "role.masters",
        roleDefault: "Mestranda",
        bioDefault: "Filosofa (IFCS/UFRJ), desenvolve manuais de gestão escolar com foco em Saúde Única, integrando divulgação científica e práticas de gestão democrática para combater a desinformação no ambiente educacional. Atua no desenvolvimento de modelos conceituais, diagnóstico das necessidades escolares e criação de conteúdos práticos.",
        links: [
            { url: "http://lattes.cnpq.br/8505365615580719", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Mestrandos"
    },
    {
        name: "Arthur da Silva Araújo",
        image: "images/Arthur.webp",
        roleKey: "role.undergrad",
        roleDefault: "Iniciação Científica",
        bioDefault: "Aluno da Faculdade de Farmácia da UFRJ, dedica-se ao estudo do efeito do imunossupressor inibidor da calcineurina Tacrolimus sobre as propriedades físico-químicas, estruturais e os principais fatores de virulência de <i>Cryptococcus neoformans</i>.",
        links: [
            { url: "http://lattes.cnpq.br/2611745264769129", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Iniciação Científica"
    },
    {
        name: "Gabriela Leão",
        image: "images/Gabi.webp",
        roleKey: "role.undergrad",
        roleDefault: "Iniciação Científica",
        bioDefault: "Aluna do Curso de Ciências Biológicas: Biofísica da UFRJ, dedica-se ao estudo da biologia e propriedades físico-químicas de <i>Cryptococcus gattii</i>.",
        links: [
            { url: "http://lattes.cnpq.br/8926140413071978", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Iniciação Científica"
    },
    {
        name: "Isabela Silveira",
        image: "images/Bela.webp",
        roleKey: "role.undergrad",
        roleDefault: "Iniciação Científica",
        bioDefault: "Aluna do curso de Conservação e Restauração da Escola de Belas Artes da UFRJ, dedica-se ao estudo de métodos químicos e físicos minimamente invasivos e não destrutivos para controle de biodeterioração fúngica em acervos culturais.",
        links: [
            { url: "#", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Iniciação Científica"
    },
    {
        name: "Igor de Avellar Guimarães",
        image: "images/Igor.webp",
        roleKey: "role.undergrad",
        roleDefault: "Iniciação Científica",
        bioDefault: "Bacharelando em Farmácia (UFRJ), estuda leveduras emergentes e reemergentes, investigando seus mecanismos de virulência, resistência a antimicrobianos e impacto nos ecossistemas, com ênfase na compreensão dos processos biológicos que determinam sua patogenicidade e os efeitos ambientais associados.",
        links: [
            { url: "http://lattes.cnpq.br/9823397099971684", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Iniciação Científica"
    },
    {
        name: "Matheus Schmitt Müller",
        image: "images/Matheus.webp",
        roleKey: "role.undergrad",
        roleDefault: "Iniciação Científica",
        bioDefault: "Bacharelando em Biotecnologia (UFRJ), Estuda mecanismos de virulência, resistência antimicrobiana e impacto ecossistêmico de leveduras, com foco na compreensão dos processos biológicos que influenciam a patogenicidade desses microrganismos e suas consequências ambientais em ecossistemas de manguezais.",
        links: [
            { url: "http://lattes.cnpq.br/4690771575216169", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Iniciação Científica"
    },
    {
        name: "Samara Ferreira",
        image: "images/Samara.webp",
        roleKey: "role.undergrad",
        roleDefault: "Iniciação Científica",
        bioDefault: "Aluna do Curso de Ciências Biológicas: Biofísica da UFRJ, dedica-se ao estudo da biologia e propriedades físico-químicas de <i>Cryptococcus neoformans</i>.",
        links: [
            { url: "http://lattes.cnpq.br/9881838261794303", icon: "fas fa-file-lines", title: "Currículo Lattes" }
        ],
        category: "Iniciação Científica"
    }
];

// Dados dos Alumni
const alumniData = [
    { name: "Bruna Arcoverde", image: "images/Bruna_Arcoverde.webp", initials: "BA" },
    { name: "Bruna de Araújo Miranda", image: "images/Bruna_Miranda.webp", initials: "BM" },
    { name: "Caroline Muiler Barbosa Nogueira", image: "images/Caroline_Muiler.webp", initials: "CN" },
    { name: "Daniel Da Fonseca Costa Campelo", image: "images/Daniel.webp", initials: "DC" },
    { name: "Guilherme Luiz Pinheiro", image: "images/Guilherme_Pinheiro.webp", initials: "GP" },
    { name: "Gustavo Dornelles Machado", image: "images/Gustavo.webp", initials: "GM" },
    { name: "Iara Bastos de Andrade", image: "images/Iara.webp", initials: "IA" },
    { name: "Julia R. S. Salles", image: "images/Julia.webp", initials: "JS" },
    { name: "Karini Castro Passos", image: "images/Karini.webp", initials: "KP" },
    { name: "Luiza Giglio Pereira", image: "images/Luiza_Pereira.webp", initials: "LG" },
    { name: "Mariana Lucy Mesquita Ramos", image: "images/Mariana_Lucy.webp", initials: "MR" },
    { name: "Pedro Henrique Martins de Souza", image: "images/Pedro_Henrique.webp", initials: "PS" },
    { name: "Raquel Ferreira Da Costa Corrêa", image: "images/Raquel_F.webp", initials: "RC" },
    { name: "Raquel Soares Da Cunha", image: "images/Raquel_S.webp", initials: "RS" },
    { name: "Victor Rodrigues", image: "images/Victor_Rodrigues.webp", initials: "VR" },
    { name: "Vinicius Alves do Nascimento", image: "images/Vinicius_Alves.webp", initials: "VA" },
    { name: "Tânia Rodrigues Alves", image: "images/Tania.webp", initials: "TR" },
    { name: "David Vidal Silva Carraro", image: "images/David.webp", initials: "DV" },
    { name: "Matheus Lukschal Mascarenhas", image: "images/Lukschal.webp", initials: "MM" },
    { name: "Andreza Estanislau Bastos", image: "images/Andreza.webp", initials: "AB" },
    { name: "Marcus Vinicius Rodrigues", image: "images/Marcus.webp", initials: "MV" },
    { name: "Juliana Godoy", image: "images/Juliana_Godoy.webp", initials: "JG" }
];

// Função para renderizar a Equipe Atual
function renderCurrentTeam() {
    const container = document.querySelector('#current-team .team-container');
    if (!container) return; // Safely exit if not on the team page

    container.innerHTML = '';

    currentTeam.forEach(member => {
        let titleHtml = '';
        if (member.titleKey || member.titleDefault) {
            titleHtml = `<p ${member.titleKey ? `data-i18n="${member.titleKey}"` : ''}>${member.titleDefault || ''}</p>`;
        }

        let bioHtml = '';
        if (member.bioKey) {
            bioHtml = `<p data-i18n="${member.bioKey}">${member.bioDefault}</p>`;
        } else {
            bioHtml = `<p>${member.bioDefault}</p>`;
        }

        let linksHtml = '';
        if (member.links && member.links.length > 0) {
            linksHtml = '<div class="member-links">';
            member.links.forEach(link => {
                linksHtml += `<a href="${link.url}" title="${link.title}"><i class="${link.icon}"></i></a>`;
            });
            linksHtml += '</div>';
        }

        const memberHtml = `
            <div class="team-member">
                <div class="member-header">
                    <img src="${member.image}" alt="${member.name}" class="team-photo" loading="lazy">
                    <div class="member-header-text">
                        <h3>${member.name}</h3>
                        <p ${member.roleKey ? `data-i18n="${member.roleKey}"` : ''}>${member.roleDefault}</p>
                        ${titleHtml}
                    </div>
                </div>
                <div class="member-content">
                    ${bioHtml}
                    ${linksHtml}
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', memberHtml);
    });
}

// Função para renderizar os Alumni
function renderAlumni() {
    const grid = document.querySelector('#alumni .alumni-grid');
    if (!grid) return;

    grid.innerHTML = '';

    alumniData.forEach(alumnus => {
        const fallbackStr = `onerror="this.outerHTML='<div class=\\'initials\\'>' + this.getAttribute('data-initials') + '</div>';"`;
        
        const cardHtml = `
            <div class="alumni-card">
                <img src="${alumnus.image}" alt="${alumnus.name}" class="alumni-photo" loading="lazy" data-initials="${alumnus.initials}" ${fallbackStr}>
                <h3>${alumnus.name}</h3>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Renderizar tudo quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    renderCurrentTeam();
    renderAlumni();
    
    // Se a função updateTranslations existir (do language-switcher), 
    // chamamos para garantir que o que foi injetado via JS seja traduzido.
    if (typeof updateTranslations === 'function') {
        setTimeout(updateTranslations, 50); // delay pequeno para garantir a inserção no DOM
    }
});
