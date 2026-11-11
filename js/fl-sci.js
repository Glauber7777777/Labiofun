/**
 * Nomes científicos em itálico (Fungilingo).
 * Usado no navegador (quiz) e pelo tools/build-fungilingo.js (glossário).
 * Para incluir um novo organismo, acrescente o gênero em GENERA e o epíteto em EPITHETS.
 * Recebe HTML já escapado; não altera o que já estiver dentro de <em> ou <i>.
 */
(function (root) {
    'use strict';
    const GENERA = [
        // fungos
        'Cryptococcus', 'Candidozyma', 'Candida', 'Nakaseomyces', 'Aspergillus', 'Histoplasma', 'Sporothrix',
        'Trichosporon', 'Rhodotorula', 'Scedosporium', 'Lomentospora', 'Pseudallescheria', 'Microsporum',
        'Nannizzia', 'Trichophyton', 'Epidermophyton', 'Emergomyces', 'Emmonsia', 'Penicillium', 'Paracoccidioides',
        'Pneumocystis', 'Fusarium', 'Malassezia', 'Coccidioides', 'Blastomyces', 'Talaromyces', 'Saccharomyces',
        'Panus', 'Mucor', 'Rhizopus', 'Lichtheimia', 'Exophiala', 'Fonsecaea', 'Cladophialophora', 'Madurella',
        'Alternaria', 'Cladosporium', 'Curvularia', 'Geotrichum', 'Pichia', 'Meyerozyma', 'Clavispora',
        'Kluyveromyces', 'Yarrowia', 'Agaricus', 'Lentinula', 'Amanita', 'Pleurotus', 'Ganoderma', 'Cordyceps',
        'Ophiocordyceps', 'Psilocybe', 'Claviceps', 'Neurospora', 'Batrachochytrium', 'Pseudogymnoascus',
        'Lacazia', 'Papiliotrema', 'Naganishia', 'Filobasidium', 'Kwoniella', 'Tremella',
        // outros organismos citados
        'Carapa', 'Pantoea', 'Klebsiella', 'Streptomyces', 'Acinetobacter', 'Leishmania', 'Trypanosoma',
        'Parabuteo', 'Galleria', 'Tenebrio', 'Caenorhabditis', 'Escherichia', 'Staphylococcus', 'Pseudomonas',
        'Mycobacterium', 'Acanthamoeba', 'Dictyostelium', 'Mus', 'Rattus', 'Columba', 'Eucalyptus'];
    const EPITHETS = ['neoformans', 'deneoformans', 'gattii', 'grubii', 'liquefaciens', 'albicans', 'auris',
        'glabrata', 'haemulonii', 'tropicalis', 'parapsilosis', 'krusei', 'kudriavzevii', 'fumigatus', 'lentulus',
        'flavus', 'niger', 'terreus', 'capsulatum', 'brasiliensis', 'lutzii', 'schenckii', 'globosa', 'asahii',
        'mucilaginosa', 'glutinis', 'prolificans', 'apiospermum', 'boydii', 'gypsea', 'canis', 'rubrum',
        'mentagrophytes', 'audouinii', 'floccosum', 'concentricum', 'africanus', 'jirovecii', 'immitis',
        'posadasii', 'dermatitidis', 'marneffei', 'cerevisiae', 'boulardii', 'furfur', 'pachydermatis', 'lecomtei',
        'bisporus', 'edodes', 'muscaria', 'ostreatus', 'guianensis', 'agglomerans', 'aerogenes', 'pneumoniae',
        'wieringae', 'amylolentus', 'wingfieldii', 'baumannii', 'amazonensis', 'cruzi', 'unicinctus', 'mellonella',
        'molitor', 'elegans', 'coli', 'aureus', 'aeruginosa', 'tuberculosis', 'castellanii', 'discoideum',
        'pedrosoi', 'mycetomatis', 'lobogeorgii', 'griseofulvum', 'musculus', 'norvegicus', 'livia', 'dendrobatidis', 'destructans', 'crassa', 'loboi', 'laurentii'];
    // Epítetos que aparecem sozinhos ("variedades neoformans e grubii") sem risco de confundir com palavras comuns
    const LONE = ['neoformans', 'deneoformans', 'gattii', 'grubii', 'albicans', 'auris', 'brasiliensis', 'schenckii', 'capsulatum'];
    const G = GENERA.join('|'), E = EPITHETS.join('|');
    const RE = new RegExp(
        '\\b(?:' + G + ')\\b(?:\\s+(?:spp?\\.|' + E + '\\b))?' +  // Gênero [espécie | spp.]
        '|\\b[A-Z]\\.\\s(?:' + E + ')\\b' +                                                         // C. neoformans
        '|\\b(?:' + LONE.join('|') + ')\\b' +
        '|\\bin\\s(?:vitro|vivo|situ|silico|natura)\\b', 'g');
    function sci(html) {
        // divide em trechos: tags/elementos já em itálico ficam intactos
        return String(html).split(/(<(?:em|i)\b[^>]*>[\s\S]*?<\/(?:em|i)>|<[^>]+>)/i)
            .map((part, k) => (k % 2) ? part : part.replace(RE, m => {
                // não inclui "spp." / "var." no itálico (convenção)
                const mm = m.match(/^(.*?)(\s+(?:spp?\.))$/);
                return mm ? `<em>${mm[1]}</em>${mm[2]}` : `<em>${m}</em>`;
            })).join('');
    }
    const api = { sci, GENERA, EPITHETS };
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.FL_SCI = api;
})(typeof window !== 'undefined' ? window : this);
