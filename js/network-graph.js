/**
 * Labiofun — Co-Authorship & Collaboration Network Graph
 * Implemented using highly optimized pure HTML5 Canvas (Zero external library dependencies).
 * Features a dynamic force-directed layout (physics), glowing neural synapses (pulse animations),
 * zoom/pan, dragging mechanics, unified author normalization, and multilingual translations.
 */

class CollaborationNetwork {
    constructor() {
        this.canvas = document.getElementById('network-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('network-visualization');
        this.tooltip = document.getElementById('network-tooltip');
        
        // Data structures
        this.rawPublications = typeof publications !== 'undefined' ? publications : [];
        this.nodes = [];
        this.edges = [];
        this.nodeMap = new Map();
        this.selectedNode = null;
        this.hoveredNode = null;
        this.activeFilter = 'all'; // 'all', 'internal', 'external'
        this.searchQuery = '';

        // Viewport transformations (zoom & pan)
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.minZoom = 0.2;
        this.maxZoom = 4.0;

        // Dragging & Panning interaction state
        this.draggedNode = null;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Physics constants (tuned to beautifully fill the larger expanded canvas)
        this.repulsionStrength = 2200; // Pushes nodes slightly further apart to prevent clustering
        this.attractionStrength = 0.045; // Smooth spring attraction force
        this.centralGravity = 0.025; // Gentle pull toward center, allowing wider distribution
        this.friction = 0.88;
        this.idealLength = 160; // Expanded joint connection length for majestic look
        this.maxVelocity = 8.0;

        // Visual effects state
        this.pulseTime = 0;
        this.pulses = []; // Animated neural pulses traveling along links

        // Initialize metadata for internal lab members to show bio on click
        this.internalMembers = {
            "Susana Frases": {
                role: {
                    "pt-BR": "Professora - Ph.D / Chefe do laboratório",
                    "en": "Professor - Ph.D / Lab Head",
                    "es-ES": "Profesora - Ph.D / Jefa de laboratorio",
                    "fr-FR": "Professeur - Ph.D / Directrice du laboratoire"
                },
                institution: "Universidade Federal do Rio de Janeiro (UFRJ)",
                bio: {
                    "pt-BR": "Bióloga, especialista em biofísica de superfícies fúngicas e na complexa interação patógeno-hospedeiro, com ênfase em mecanismos de virulência, resistência antimicrobiana, impacto ecossistêmico e mudanças climáticas.",
                    "en": "Biologist, specialist in biophysics of fungal surfaces and the complex pathogen-host interaction, emphasizing virulence mechanisms, antimicrobial resistance, ecosystem impact, and climate change.",
                    "es-ES": "Bióloga, especialista en biofísica de superficies fúngicas y en la compleja interacción patógeno-hospedador, con énfasis en mecanismos de virulencia, resistencia antimicrobiana, impacto ecosistémico y cambio climático.",
                    "fr-FR": "Biologiste, spécialiste de la biophysique des surfaces fongiques et de l'interaction complexe pathogène-hôte, avec un accent sur les mécanismes de virulence, la résistance antimicrobienne, l'impact écosystémique et le changement climatique."
                },
                photo: "images/Susana.webp"
            },
            "Christina Maeda Takiya": {
                role: {
                    "pt-BR": "Professora - M.D & Ph.D / Colaboradora Interna",
                    "en": "Professor - M.D & Ph.D / Internal Collaborator",
                    "es-ES": "Profesora - M.D & Ph.D / Colaboradora Interna",
                    "fr-FR": "Professeur - M.D & Ph.D / Collaboratrice Interne"
                },
                institution: "UFRJ",
                bio: {
                    "pt-BR": "Médica patologista, especialista em morfologia, patologia e regeneração tecidual. Atua em conjunto nas análises estruturais e de tecidos de modelos de infecção.",
                    "en": "Pathologist, specialist in morphology, pathology, and tissue regeneration. Collaborates in structural and tissue analyses of infection models.",
                    "es-ES": "Médica patóloga, especialista en morfología, patología y regeneración tisular. Colabora en los análisis estructurales y de tejidos de modelos de infección.",
                    "fr-FR": "Médecin pathologiste, spécialiste en morphologie, pathologie et régénération tissulaire. Elle collabore aux analyses structurales et tissulaires des modèles d'infection."
                },
                photo: "images/Takiya.webp"
            },
            "Dario Corrêa-Junior": {
                role: {
                    "pt-BR": "Pós-doutor - Ph.D",
                    "en": "Postdoctoral Researcher - Ph.D",
                    "es-ES": "Investigador Postdoctoral - Ph.D",
                    "fr-FR": "Chercheur Postdoctoral - Ph.D"
                },
                institution: "UFRJ",
                bio: {
                    "pt-BR": "Biólogo, especialista na área de microbiologia, com ênfase em micologia, mecanismos de virulência, resistência antimicrobiana e impacto ecológico (One Health).",
                    "en": "Biologist, specialist in microbiology, with emphasis on mycology, virulence mechanisms, antimicrobial resistance, and ecological impact (One Health).",
                    "es-ES": "Biólogo, especialista en el área de microbiología, con énfasis en micología, mecanismos de virulencia, resistencia antimicrobiana e impacto ecológico (Saúde Única).",
                    "fr-FR": "Biologiste, spécialiste en microbiologie, avec un accent sur la mycologie, les mécanismes de virulence, la résistance antimicrobienne et l'impact écologique (One Health)."
                },
                photo: "images/Dario.webp"
            },
            "Glauber R. S. Araujo": {
                role: {
                    "pt-BR": "Pós-doutor - Ph.D",
                    "en": "Postdoctoral Researcher - Ph.D",
                    "es-ES": "Investigador Postdoctoral - Ph.D",
                    "fr-FR": "Chercheur Postdoctoral - Ph.D"
                },
                institution: "UFRJ",
                bio: {
                    "pt-BR": "Biofísico, especialista em caracterização estrutural e mecânica de superfícies fúngicas usando espalhamento de luz, mecânica celular, microscopia óptica de super-resolução e eletrônica.",
                    "en": "Biophysicist, specialist in structural and mechanical characterization of fungal surfaces using light scattering, cell mechanics, super-resolution optical and electron microscopy.",
                    "es-ES": "Biofísico, especialista en caracterización estructural y mecánica de superficies fúngicas usando dispersión de luz, mecánica celular, microscopía óptica de superresolución y electrónica.",
                    "fr-FR": "Biophysicien, spécialiste de la caractérisation structurale et mécanique des surfaces fongiques par diffusion de la lumière, mécanique cellulaire, microscopie optique de super-résolution et électronique."
                },
                photo: "images/Glauber.webp"
            },
            "Juliana Britto": {
                role: {
                    "pt-BR": "Doutoranda",
                    "en": "Ph.D. Student",
                    "es-ES": "Estudiante de Doctorado",
                    "fr-FR": "Doctorante"
                },
                institution: "UFRJ",
                bio: {
                    "pt-BR": "Bióloga, investigando mecanismos de virulência, diversidade e impacto de fungos em ecossistemas sob pressão ambiental (como manguezais).",
                    "en": "Biologist, researching virulence mechanisms, diversity, and impact of fungi in ecosystems under environmental pressure (such as mangroves).",
                    "es-ES": "Bióloga, investigando mecanismos de virulencia, diversidad e impacto de hongos en ecosistemas bajo presión ambiental (como manglares).",
                    "fr-FR": "Biologiste, étudiant les mécanismes de virulence, la diversité et l'impact des champignons dans les écosystèmes sous pression environnementale (comme les mangroves)."
                },
                photo: "images/Juliana.webp"
            },
            "Mariana B. Barbieri": {
                role: {
                    "pt-BR": "Mestranda",
                    "en": "M.Sc. Student",
                    "es-ES": "Estudiante de Maestría",
                    "fr-FR": "Étudiante en Master"
                },
                institution: "UFRJ",
                bio: {
                    "pt-BR": "Biotecnologista, com foco em biotecnologia fúngica aplicada, diversidade microbiológica e controle de biodegradação na Amazônia.",
                    "en": "Biotechnologist, focusing on applied fungal biotechnology, microbiological diversity, and biodegradation control in the Amazon.",
                    "es-ES": "Biotecnóloga, con enfoque en biotecnología fúngica aplicada, diversidad microbiológica y control de biodegradación en la Amazonía.",
                    "fr-FR": "Biotechnologiste, spécialisée dans la biotechnologie fongique appliquée, la diversité microbiologique et le contrôle de la biodégradation en Amazonie."
                },
                photo: "images/Mariana.webp"
            }
        };

        this.init();
    }

    /**
     * Normalize author spellings to unique node keys
     */
    normalizeAuthorName(name) {
        if (!name) return '';
        let n = name.trim();
        const norm = n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (norm.includes("frases") || norm === "frases, s.") {
            return "Susana Frases";
        }
        if (norm.includes("glauber") && (norm.includes("araujo") || norm.includes("sousa"))) {
            return "Glauber R. S. Araujo";
        }
        if (norm.includes("dario") && norm.includes("correa")) {
            return "Dario Corrêa-Junior";
        }
        if (norm.includes("iara") && norm.includes("andrade")) {
            return "Iara Bastos de Andrade";
        }
        if (norm.includes("vinicius") && norm.includes("alves")) {
            return "Vinicius Alves";
        }
        if (norm.includes("mariana") && norm.includes("ramos")) {
            return "Mariana Lucy Mesquita Ramos";
        }
        if (norm.includes("zamith") && norm.includes("miranda")) {
            return "Daniel Zamith-Miranda";
        }
        if (norm.includes("almeida") && norm.includes("paes")) {
            return "Rodrigo Almeida-Paes";
        }
        if (norm.includes("nimrichter")) {
            return "Leonardo Nimrichter";
        }
        if (norm.includes("nosanchuk")) {
            return "Joshua D. Nosanchuk";
        }
        if (norm.includes("marcio") && norm.includes("rodrigues")) {
            return "Marcio L. Rodrigues";
        }
        if (norm.includes("pontes")) {
            return "Bruno Pontes";
        }
        if (norm.includes("viana") || norm === "n. b. viana" || norm.includes("nathan b")) {
            return "Nathan B. Viana";
        }
        if (norm.includes("juliana") && norm.includes("britto")) {
            return "Juliana Britto";
        }
        if (norm.includes("takiya")) {
            return "Christina Maeda Takiya";
        }
        if (norm.includes("mariana") && norm.includes("barbieri")) {
            return "Mariana B. Barbieri";
        }
        if (norm.includes("gustavo") && norm.includes("dornelles")) {
            return "Gustavo Dornelles Machado";
        }
        if (norm.includes("casadevall")) {
            return "Arturo Casadevall";
        }
        if (norm.includes("guimaraes") && (norm.includes("allan") || norm.includes("a. j."))) {
            return "Allan Jefferson Guimarães";
        }
        if (norm.includes("martinez") && norm.includes("luis")) {
            return "Luis R. Martinez";
        }
        if (norm.includes("daniel") && norm.includes("campelo")) {
            return "Daniel Campelo";
        }
        if (norm.includes("caroline") && norm.includes("muiler")) {
            return "Caroline Muiler";
        }
        
        // Return standard capitalized format otherwise
        return n;
    }

    /**
     * Build nodes and edges from publications list
     */
    buildNetworkData() {
        const authorPubCount = new Map();
        const connectionPairs = new Map();

        // 1. Process all publications to extract co-authors
        this.rawPublications.forEach(pub => {
            if (!pub.authors) return;

            // Split authors by commas or semicolons
            const authorList = pub.authors
                .split(/[,;]\s*/)
                .map(a => this.normalizeAuthorName(a))
                .filter(a => a.length > 0);

            // Register total publications per author
            authorList.forEach(author => {
                authorPubCount.set(author, (authorPubCount.get(author) || 0) + 1);
            });

            // Register co-authorship links (undirected pairs)
            for (let i = 0; i < authorList.length; i++) {
                for (let j = i + 1; j < authorList.length; j++) {
                    const a1 = authorList[i];
                    const a2 = authorList[j];
                    if (a1 === a2) continue;

                    const pairId = a1 < a2 ? `${a1}|||${a2}` : `${a2}|||${a1}`;
                    connectionPairs.set(pairId, (connectionPairs.get(pairId) || 0) + 1);
                }
            }
        });

        // 2. Filter: To keep graph clean, professional and lightweight (no visual noise)
        // We include "Susana Frases" ALWAYS as center.
        // We only include other authors who have published AT LEAST 2 papers.
        // This yields a highly relevant, deeply integrated network of 25-35 key nodes.
        const MIN_PUBS_THRESHOLD = 2;
        const activeAuthors = new Set();
        activeAuthors.add("Susana Frases");

        authorPubCount.forEach((count, author) => {
            if (count >= MIN_PUBS_THRESHOLD) {
                activeAuthors.add(author);
            }
        });

        // 3. Build Node Objects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        let index = 0;
        const count = activeAuthors.size;

        activeAuthors.forEach(author => {
            const pubCount = authorPubCount.get(author) || 0;
            
            // Determine Node Type
            let type = 'external';
            if (author === "Susana Frases") {
                type = 'central';
            } else if (this.internalMembers[author] || 
                       ["Iara Bastos de Andrade", "Gustavo Dornelles Machado", "Caroline Muiler", "Daniel Campelo"].includes(author)) {
                type = 'internal';
            }

            // Distribute nodes circularly to start simulation harmoniously
            const angle = (index / count) * Math.PI * 2;
            const dist = type === 'central' ? 0 : 100 + Math.random() * 200;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            // Radius scales dynamically with publication count (rich interactive hierarchy)
            let baseRad = 8;
            if (type === 'central') baseRad = 22;
            else if (type === 'internal') baseRad = 10;
            const radius = baseRad + Math.min(pubCount * 0.8, 14);

            const node = {
                id: author,
                label: this.getShortLabel(author),
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                radius: radius,
                type: type,
                pubCount: pubCount,
                px: x, // for drag
                py: y,
                isPinned: false
            };

            this.nodes.push(node);
            this.nodeMap.set(author, node);
            index++;
        });

        // 4. Build Edge Objects
        connectionPairs.forEach((weight, pairId) => {
            const [a1, a2] = pairId.split('|||');
            if (activeAuthors.has(a1) && activeAuthors.has(a2)) {
                this.edges.push({
                    source: this.nodeMap.get(a1),
                    target: this.nodeMap.get(a2),
                    weight: weight
                });
            }
        });

        // Seed some initial random pulses
        for (let i = 0; i < 5; i++) {
            this.spawnNeuralPulse();
        }
    }

    /**
     * Get shorter label for UI clarity
     */
    getShortLabel(name) {
        if (name === "Susana Frases") return "Susana Frases";
        if (name === "Dario Corrêa-Junior") return "Dario Corrêa-Jr";
        if (name === "Glauber R. S. Araujo") return "Glauber Araujo";
        if (name === "Mariana Lucy Mesquita Ramos") return "Mariana Lucy";
        if (name === "Juliana Britto Martins de Oliveira") return "Juliana Britto";
        if (name === "Allan Jefferson Guimarães") return "Allan Guimarães";
        
        // Remove mid-initials if too long
        const parts = name.split(' ');
        if (parts.length > 2) {
            return `${parts[0]} ${parts[parts.length - 1]}`;
        }
        return name;
    }

    /**
     * Dynamic Force-Directed Simulation Tick
     */
    updatePhysics() {
        if (this.draggedNode) {
            // Keep dragged node pinned at mouse position
            const mouseTransformed = this.getTransformedCoordinates(this.mouseX, this.mouseY);
            this.draggedNode.x = mouseTransformed.x;
            this.draggedNode.y = mouseTransformed.y;
            this.draggedNode.vx = 0;
            this.draggedNode.vy = 0;
        }

        const len = this.nodes.length;

        // 1. Repulsion (Coulomb Force between all node pairs to avoid overlaps)
        for (let i = 0; i < len; i++) {
            const n1 = this.nodes[i];
            for (let j = i + 1; j < len; j++) {
                const n2 = this.nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                let dist = Math.hypot(dx, dy);
                if (dist < 1) dist = 1; // Prevent division by zero

                // Force increases when nodes are closer
                const force = this.repulsionStrength / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                // Apply opposing forces
                if (!n1.isPinned) {
                    n1.vx -= fx;
                    n1.vy -= fy;
                }
                if (!n2.isPinned) {
                    n2.vx += fx;
                    n2.vy += fy;
                }
            }
        }

        // 2. Attraction (Spring Force along connection edges)
        this.edges.forEach(edge => {
            const n1 = edge.source;
            const n2 = edge.target;
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy) || 1;

            // Spring force: stronger links pull nodes closer
            const springForce = (dist - this.idealLength) * this.attractionStrength * Math.sqrt(edge.weight);
            const fx = (dx / dist) * springForce;
            const fy = (dy / dist) * springForce;

            if (!n1.isPinned) {
                n1.vx += fx;
                n1.vy += fy;
            }
            if (!n2.isPinned) {
                n2.vx -= fx;
                n2.vy -= fy;
            }
        });

        // 3. Central Gravity (Pulls all nodes toward center to prevent dispersion)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.nodes.forEach(node => {
            if (node.isPinned) return;

            const dx = centerX - node.x;
            const dy = centerY - node.y;
            const dist = Math.hypot(dx, dy) || 1;

            // Subtle pull
            node.vx += dx * this.centralGravity;
            node.vy += dy * this.centralGravity;
        });

        // 4. Update Node Positions with Friction and Speed Cap
        this.nodes.forEach(node => {
            if (node.isPinned) return;

            // Apply friction
            node.vx *= this.friction;
            node.vy *= this.friction;

            // Limit maximum velocity for simulation stability
            const speed = Math.hypot(node.vx, node.vy);
            if (speed > this.maxVelocity) {
                node.vx = (node.vx / speed) * this.maxVelocity;
                node.vy = (node.vy / speed) * this.maxVelocity;
            }

            node.x += node.vx;
            node.y += node.vy;
        });
    }

    /**
     * Check if a node is currently filtered out by active filters or search queries
     */
    isNodeFiltered(node) {
        // 1. Check category filter
        if (this.activeFilter !== 'all') {
            if (this.activeFilter === 'internal') {
                if (node.type !== 'central' && node.type !== 'internal') {
                    return true;
                }
            } else if (this.activeFilter === 'external') {
                if (node.type !== 'external') {
                    return true;
                }
            }
        }

        // 2. Check search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            const name = node.id.toLowerCase();
            const institution = (node.institution || '').toLowerCase();
            if (!name.includes(query) && !institution.includes(query)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Update active category filter and redraw
     */
    setFilter(filterType) {
        this.activeFilter = filterType;
        this.checkSelectionFiltered();
        this.draw();
    }

    /**
     * Update search query and redraw
     */
    setSearchQuery(query) {
        this.searchQuery = query;
        this.checkSelectionFiltered();
        this.draw();
    }

    /**
     * Unselect node if it is currently filtered out
     */
    checkSelectionFiltered() {
        if (this.selectedNode && this.isNodeFiltered(this.selectedNode)) {
            this.selectNode(null);
        }
    }

    /**
     * Draw the complete graph in the Canvas
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply Zooming and Panning transformation
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // Determine if we should fade out unselected nodes
        const hasSelection = this.selectedNode !== null;
        const activeHover = this.hoveredNode !== null;
        const highlightNode = this.hoveredNode || this.selectedNode;

        // 1. Draw Links (Edges)
        this.edges.forEach(edge => {
            const n1 = edge.source;
            const n2 = edge.target;

            // Skip drawing if either node is filtered out
            if (this.isNodeFiltered(n1) || this.isNodeFiltered(n2)) return;

            // Calculate if link should be highlighted
            let isHighlighted = false;
            let opacity = 0.15; // faded default when selected

            if (!hasSelection && !activeHover) {
                opacity = 0.35; // normal default
            } else if (highlightNode && (n1.id === highlightNode.id || n2.id === highlightNode.id)) {
                isHighlighted = true;
                opacity = 0.85; // highlighted focus
            }

            // Draw line
            this.ctx.beginPath();
            this.ctx.moveTo(n1.x, n1.y);
            this.ctx.lineTo(n2.x, n2.y);
            
            // Proportional width for multiple joint publications
            this.ctx.lineWidth = Math.min(1 + edge.weight * 0.8, 6);
            
            // Visual premium style: glows and gradients
            if (isHighlighted) {
                this.ctx.strokeStyle = 'rgba(78, 205, 196, ' + opacity + ')'; // Cyan glow
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = 'rgba(78, 205, 196, 0.4)';
            } else {
                this.ctx.strokeStyle = 'rgba(180, 185, 200, ' + opacity + ')';
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.stroke();
            this.ctx.shadowBlur = 0; // reset
        });

        // 2. Draw animated glowing synaptic pulses traveling along edges
        this.drawNeuralPulses(highlightNode, hasSelection, activeHover);

        // 3. Draw Nodes
        this.nodes.forEach(node => {
            // Skip drawing if node is filtered out
            if (this.isNodeFiltered(node)) return;

            let opacity = 0.25; // faded default
            let isHighlighted = false;

            if (!hasSelection && !activeHover) {
                opacity = 1.0;
            } else if (highlightNode) {
                if (node.id === highlightNode.id) {
                    isHighlighted = true;
                    opacity = 1.0;
                } else {
                    // Check if neighbor
                    const isNeighbor = this.edges.some(edge => 
                        (edge.source.id === highlightNode.id && edge.target.id === node.id) ||
                        (edge.target.id === highlightNode.id && edge.source.id === node.id)
                    );
                    if (isNeighbor) {
                        isHighlighted = true;
                        opacity = 0.95;
                    }
                }
            }

            this.ctx.save();
            this.ctx.globalAlpha = opacity;

            // Draw Node glowing circle
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

            // Establish color theme based on node type
            let fillGrad = this.ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, node.radius);
            
            if (node.type === 'central') {
                // Gold / Honey glowing center (PI)
                fillGrad.addColorStop(0, '#FFF3A3');
                fillGrad.addColorStop(0.3, '#FBC02D');
                fillGrad.addColorStop(1, '#D32F2F');
                this.ctx.fillStyle = fillGrad;
                this.ctx.strokeStyle = '#FBC02D';
                this.ctx.lineWidth = 3;
                
                // Extra external orbits for Susana
                this.ctx.shadowBlur = isHighlighted ? 25 : 12;
                this.ctx.shadowColor = 'rgba(251, 192, 45, 0.6)';
            } else if (node.type === 'internal') {
                // Lab internal members (current & alumni) -> bright glowing cyan/emerald
                fillGrad.addColorStop(0, '#E0F7FA');
                fillGrad.addColorStop(0.4, '#4ECDB4');
                fillGrad.addColorStop(1, '#1A7A68');
                this.ctx.fillStyle = fillGrad;
                this.ctx.strokeStyle = '#4ECDB4';
                this.ctx.lineWidth = 2;
                this.ctx.shadowBlur = isHighlighted ? 15 : 6;
                this.ctx.shadowColor = 'rgba(78, 205, 196, 0.5)';
            } else {
                // External Collaborators -> royal deep blue/violet
                fillGrad.addColorStop(0, '#E8EAF6');
                fillGrad.addColorStop(0.4, '#5C6BC0');
                fillGrad.addColorStop(1, '#283593');
                this.ctx.fillStyle = fillGrad;
                this.ctx.strokeStyle = '#5C6BC0';
                this.ctx.lineWidth = 1.5;
                this.ctx.shadowBlur = isHighlighted ? 12 : 4;
                this.ctx.shadowColor = 'rgba(92, 107, 192, 0.4)';
            }

            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.shadowBlur = 0; // reset

            // Central node outer rotating dashed ring (visually stunning premium detail)
            if (node.type === 'central') {
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(251, 192, 45, 0.35)';
                this.ctx.lineWidth = 1.5;
                this.ctx.setLineDash([4, 6]);
                // Rotate over time
                this.ctx.translate(node.x, node.y);
                this.ctx.rotate(this.pulseTime * 0.015);
                this.ctx.translate(-node.x, -node.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]); // reset
            }

            this.ctx.restore();

            // 4. Draw Label (Text below node)
            this.ctx.save();
            this.ctx.globalAlpha = opacity;
            
            // Text typography
            const isLabelFocused = isHighlighted || (node === this.selectedNode);
            this.ctx.font = isLabelFocused ? 'bold 12px var(--font-body), sans-serif' : '500 11px var(--font-body), sans-serif';
            this.ctx.fillStyle = isLabelFocused ? '#1D2D44' : '#5A6E85';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            
            // Draw subtle white text shadow for legibility over links
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            this.ctx.shadowBlur = 4;
            
            this.ctx.fillText(node.label, node.x, node.y + node.radius + 6);
            
            // Show dynamic pub indicator badge on hover
            if (isLabelFocused && node.pubCount > 0) {
                this.ctx.font = '700 9px monospace';
                this.ctx.fillStyle = node.type === 'central' ? '#D32F2F' : (node.type === 'internal' ? '#1A7A68' : '#283593');
                this.ctx.fillText(`(${node.pubCount})`, node.x, node.y + node.radius + 20);
            }
            
            this.ctx.restore();
        });

        this.ctx.restore(); // restore viewport transform
    }

    /**
     * Spawns an animated electrical pulse that travels along a network link
     */
    spawnNeuralPulse() {
        if (this.edges.length === 0) return;
        
        // Pick random edge
        const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
        
        // Determine travel direction randomly
        const reverse = Math.random() > 0.5;
        const source = reverse ? edge.target : edge.source;
        const target = reverse ? edge.source : edge.target;
        
        this.pulses.push({
            source: source,
            target: target,
            progress: 0,
            speed: 0.005 + Math.random() * 0.015,
            color: source.type === 'central' || target.type === 'central' ? 'rgba(251, 192, 45, 0.9)' : 'rgba(78, 205, 196, 0.9)'
        });
    }

    /**
     * Update and draw neural pulses
     */
    drawNeuralPulses(highlightNode, hasSelection, activeHover) {
        // Filter out completed pulses
        this.pulses = this.pulses.filter(p => p.progress < 1.0);

        // Periodically spawn new pulses to keep network alive
        if (this.pulses.length < 15 && Math.random() < 0.05) {
            this.spawnNeuralPulse();
        }

        this.pulses.forEach(pulse => {
            const n1 = pulse.source;
            const n2 = pulse.target;

            // Skip pulse if either source or target node is filtered out
            if (this.isNodeFiltered(n1) || this.isNodeFiltered(n2)) return;

            pulse.progress += pulse.speed;
            if (pulse.progress > 1.0) pulse.progress = 1.0;

            // Interpolate position
            const px = n1.x + (n2.x - n1.x) * pulse.progress;
            const py = n1.y + (n2.y - n1.y) * pulse.progress;

            // Fading rules matching highlight state
            let opacity = 0.3;
            if (!hasSelection && !activeHover) {
                opacity = 0.9;
            } else if (highlightNode && (n1.id === highlightNode.id || n2.id === highlightNode.id)) {
                opacity = 1.0;
            }

            // Draw glowing synapse particle
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2.5 + Math.sin(this.pulseTime * 0.1) * 0.8, 0, Math.PI * 2);
            this.ctx.fillStyle = pulse.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = pulse.color;
            this.ctx.globalAlpha = opacity;
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // reset
            this.ctx.globalAlpha = 1.0;
        });
    }

    /**
     * Map screen coordinates to zoomed/panned coordinate system
     */
    getTransformedCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left - this.panX) / this.zoom;
        const y = (clientY - rect.top - this.panY) / this.zoom;
        return { x, y };
    }

    /**
     * Find node situated under screen coordinates
     */
    getNodeAtPosition(x, y) {
        const coords = this.getTransformedCoordinates(x, y);
        
        // Loop backwards to check top rendered elements first
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            
            // Skip filtered out nodes so they can't be hovered or clicked
            if (this.isNodeFiltered(node)) continue;

            const dist = Math.hypot(coords.x - node.x, coords.y - node.y);
            // Include a padding for easier clicking on smaller mobile nodes
            if (dist <= node.radius + 6) {
                return node;
            }
        }
        return null;
    }

    /**
     * Pan graph to center a specific node gracefully
     */
    centerOnNode(node) {
        const targetX = this.canvas.width / 2 - node.x * this.zoom;
        const targetY = this.canvas.height / 2 - node.y * this.zoom;
        
        // Animate transition using simple spring interpolation over multiple frames
        let frames = 0;
        const animateCentering = () => {
            if (frames >= 20 || this.isPanning || this.draggedNode) return;
            this.panX += (targetX - this.panX) * 0.15;
            this.panY += (targetY - this.panY) * 0.15;
            frames++;
            requestAnimationFrame(animateCentering);
        };
        animateCentering();
    }

    /**
     * Reset Zoom and Pan parameters to default
     */
    resetView() {
        this.zoom = 1.0;
        
        // Find bounding box of nodes
        if (this.nodes.length === 0) return;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.nodes.forEach(n => {
            if (n.x < minX) minX = n.x;
            if (n.x > maxX) maxX = n.x;
            if (n.y < minY) minY = n.y;
            if (n.y > maxY) maxY = n.y;
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.panX = this.canvas.width / 2 - centerX;
        this.panY = this.canvas.height / 2 - centerY;
    }

    /**
     * Highlight a node and populate its profile bio & publication list in side panel
     */
    selectNode(node) {
        this.selectedNode = node;
        
        const placeholder = document.getElementById('panel-placeholder');
        const content = document.getElementById('panel-content');
        if (!placeholder || !content) return;

        if (!node) {
            placeholder.style.display = 'block';
            content.style.display = 'none';
            return;
        }

        placeholder.style.display = 'none';
        content.style.display = 'block';

        // 1. Fill Author Header Metadata
        const nameEl = document.getElementById('panel-author-name');
        const instEl = document.getElementById('panel-author-institution');
        const countEl = document.getElementById('panel-co-count');
        const countLabelEl = document.getElementById('panel-co-count-label');
        
        nameEl.textContent = node.id === "Susana Frases" ? "Susana Frasés Carvajal" : node.id;
        
        // Retrieve localized details (current Lang)
        const curLang = (typeof window.languageSwitcher !== 'undefined') ? window.languageSwitcher.getCurrentLanguage() : 'pt-BR';
        
        let role = '';
        let institution = 'Colaborador';
        let bio = 'Pesquisador associado ao Laboratório de Biofísica de Fungos da UFRJ.';
        
        // Dynamic Bios mapping
        if (this.internalMembers[node.id]) {
            const m = this.internalMembers[node.id];
            role = m.role[curLang] || m.role['pt-BR'] || '';
            institution = m.institution;
            bio = m.bio[curLang] || m.bio['pt-BR'] || '';
        } else if (typeof collaborators !== 'undefined') {
            // Lookup in external collaborators list
            const ext = collaborators.find(c => this.normalizeAuthorName(c.name) === node.id);
            if (ext) {
                role = 'Colaborador Externo';
                institution = ext.institution;
                bio = ext.description;
            }
        }
        
        instEl.innerHTML = `<strong>${role}</strong><br>${institution}`;
        
        // Insert custom bio text description
        let bioEl = document.getElementById('panel-author-bio');
        if (!bioEl) {
            bioEl = document.createElement('p');
            bioEl.id = 'panel-author-bio';
            bioEl.className = 'panel-bio';
            instEl.parentNode.insertBefore(bioEl, instEl.nextSibling);
        }
        bioEl.innerHTML = bio;

        // Display photo if available
        let imgEl = document.getElementById('panel-author-photo');
        if (!imgEl) {
            imgEl = document.createElement('img');
            imgEl.id = 'panel-author-photo';
            imgEl.className = 'panel-photo';
            nameEl.parentNode.insertBefore(imgEl, nameEl);
        }
        
        if (this.internalMembers[node.id] && this.internalMembers[node.id].photo) {
            imgEl.src = this.internalMembers[node.id].photo;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none';
        }

        // 2. Filter publications list containing selected author
        const pubsList = document.getElementById('panel-pubs-list');
        pubsList.innerHTML = '';
        
        let coPubs = [];
        this.rawPublications.forEach(pub => {
            if (!pub.authors) return;
            const normalizedAuthors = pub.authors.split(/[,;]\s*/).map(a => this.normalizeAuthorName(a));
            if (normalizedAuthors.includes(node.id)) {
                coPubs.push(pub);
            }
        });

        // Set counters
        countEl.textContent = coPubs.length;

        // Build list
        coPubs.forEach(pub => {
            const pubDiv = document.createElement('div');
            pubDiv.className = 'panel-pub-item';
            
            // Highlight own normalized author key
            const highlightedAuthors = pub.authors
                .replace(new RegExp(node.id, 'g'), `<strong>${node.id}</strong>`)
                .replace("Susana Frases", "<strong>Susana Frasés</strong>");

            pubDiv.innerHTML = `
                <h5>${pub.title}</h5>
                <p class="panel-pub-authors">${highlightedAuthors}</p>
                <p class="panel-pub-journal">${pub.journal} (${pub.year})</p>
                ${pub.doi ? `<a href="https://doi.org/${pub.doi.replace('https://doi.org/', '')}" target="_blank" class="panel-pub-doi"><i class="fas fa-external-link-alt"></i> DOI</a>` : ''}
            `;
            pubsList.appendChild(pubDiv);
        });

        // Highlight this node and focus center
        this.centerOnNode(node);
    }

    /**
     * Mouse Movement Interaction Handler (Hover detection)
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        if (this.isPanning) {
            // Pan viewport
            this.panX = this.mouseX - this.startX;
            this.panY = this.mouseY - this.startY;
            return;
        }

        if (this.draggedNode) {
            return;
        }

        // Hover detection
        const node = this.getNodeAtPosition(e.clientX, e.clientY);
        if (node) {
            this.canvas.style.cursor = 'pointer';
            if (this.hoveredNode !== node) {
                this.hoveredNode = node;
                this.showTooltip(e.clientX, e.clientY, `${node.id}<br><small>${node.pubCount} ${node.pubCount === 1 ? 'publicação' : 'publicações'}</small>`);
            }
        } else {
            this.canvas.style.cursor = this.isPanning ? 'grabbing' : 'grab';
            if (this.hoveredNode !== null) {
                this.hoveredNode = null;
                this.hideTooltip();
            }
        }
    }

    /**
     * Show Tooltip over mouse
     */
    showTooltip(x, y, htmlContent) {
        const rect = this.container.getBoundingClientRect();
        this.tooltip.innerHTML = htmlContent;
        this.tooltip.style.display = 'block';
        
        // Center tooltip over mouse position
        const tooltipRect = this.tooltip.getBoundingClientRect();
        this.tooltip.style.left = `${x - rect.left - tooltipRect.width / 2}px`;
        this.tooltip.style.top = `${y - rect.top - tooltipRect.height - 12}px`;
    }

    /**
     * Hide Tooltip
     */
    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    /**
     * Resize Canvas dynamically matching viewport container
     */
    resize() {
        const w = this.container.clientWidth;
        const h = Math.max(window.innerHeight * 0.80, 580); // Fluid height increased to 80% viewport, minimum 580px
        
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
        
        this.resetView();
    }

    /**
     * Bind all interactive Event Listeners
     */
    attachEventListeners() {
        // Mouse Down (Drag node or Pan view)
        this.canvas.addEventListener('mousedown', e => {
            const node = this.getNodeAtPosition(e.clientX, e.clientY);
            if (node) {
                this.draggedNode = node;
                node.isPinned = true;
                this.selectNode(node);
            } else {
                this.isPanning = true;
                this.startX = this.mouseX - this.panX;
                this.startY = this.mouseY - this.panY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        // Mouse Move
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Mouse Up / Drag End
        window.addEventListener('mouseup', () => {
            if (this.draggedNode) {
                this.draggedNode.isPinned = false;
                this.draggedNode = null;
            }
            this.isPanning = false;
            this.canvas.style.cursor = 'grab';
        });

        // Touch support for Mobile Devices (pinch & drag support)
        this.canvas.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const node = this.getNodeAtPosition(touch.clientX, touch.clientY);
                if (node) {
                    this.draggedNode = node;
                    node.isPinned = true;
                    this.selectNode(node);
                    e.preventDefault();
                } else {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouseX = touch.clientX - rect.left;
                    this.mouseY = touch.clientY - rect.top;
                    this.isPanning = true;
                    this.startX = this.mouseX - this.panX;
                    this.startY = this.mouseY - this.panY;
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', e => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = touch.clientX - rect.left;
                this.mouseY = touch.clientY - rect.top;
                
                if (this.isPanning) {
                    this.panX = this.mouseX - this.startX;
                    this.panY = this.mouseY - this.startY;
                    e.preventDefault();
                } else if (this.draggedNode) {
                    const mouseTransformed = this.getTransformedCoordinates(touch.clientX, touch.clientY);
                    this.draggedNode.x = mouseTransformed.x;
                    this.draggedNode.y = mouseTransformed.y;
                    e.preventDefault();
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            if (this.draggedNode) {
                this.draggedNode.isPinned = false;
                this.draggedNode = null;
            }
            this.isPanning = false;
        });

        // Wheel Zooming (focused at mouse pointer)
        this.canvas.addEventListener('wheel', e => {
            e.preventDefault();
            
            const zoomFactor = 1.1;
            const mouseBeforeZoom = this.getTransformedCoordinates(e.clientX, e.clientY);
            
            if (e.deltaY < 0) {
                // Zoom In
                this.zoom = Math.min(this.zoom * zoomFactor, this.maxZoom);
            } else {
                // Zoom Out
                this.zoom = Math.max(this.zoom / zoomFactor, this.minZoom);
            }
            
            // Adjust pan offset to center zoom correctly on mouse coordinates
            const rect = this.canvas.getBoundingClientRect();
            const mouseXScreen = e.clientX - rect.left;
            const mouseYScreen = e.clientY - rect.top;
            
            this.panX = mouseXScreen - mouseBeforeZoom.x * this.zoom;
            this.panY = mouseYScreen - mouseBeforeZoom.y * this.zoom;
        }, { passive: false });

        // ZOOM CONTROLS UI BUTTONS
        const zoomInBtn = document.getElementById('network-zoom-in');
        const zoomOutBtn = document.getElementById('network-zoom-out');
        const resetBtn = document.getElementById('network-reset');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoom = Math.min(this.zoom * 1.25, this.maxZoom);
            });
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoom = Math.max(this.zoom / 1.25, this.minZoom);
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetView();
            });
        }

        // Window resizing listener
        window.addEventListener('resize', this.resize.bind(this));

        // Tab activation resize trigger to avoid 0x0 size canvas issues when hidden
        const tabBtn = document.querySelector('[data-pub-type="network"]');
        if (tabBtn) {
            tabBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.resize();
                    this.resetView();
                }, 50); // Small timeout to ensure display: block is applied
            });
        }

        // SEARCH BOX EVENT LISTENER
        const searchInput = document.getElementById('network-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', e => {
                this.setSearchQuery(e.target.value);
            });
        }

        // FILTER TABS EVENT LISTENERS
        const filterBtns = document.querySelectorAll('.network-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setFilter(btn.getAttribute('data-filter'));
            });
        });

        // Translation update hook
        document.addEventListener('languageChanged', () => {
            if (this.selectedNode) {
                this.selectNode(this.selectedNode);
            }
        });
    }

    /**
     * High-Performance Physics & Rendering Animation Loop
     */
    tick() {
        this.pulseTime++;
        this.updatePhysics();
        this.draw();
        requestAnimationFrame(this.tick.bind(this));
    }

    /**
     * Main class entry point
     */
    init() {
        this.buildNetworkData();
        this.resize();
        this.attachEventListeners();
        
        // Select Susana Frases initially to populate default values
        const susanaNode = this.nodeMap.get("Susana Frases");
        if (susanaNode) {
            setTimeout(() => {
                this.selectNode(susanaNode);
            }, 300);
        }

        // Start 60fps game loop
        requestAnimationFrame(this.tick.bind(this));
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Only execute if network visualization container exists
    if (document.getElementById('network-canvas')) {
        window.collaborationNetwork = new CollaborationNetwork();
    }
});
