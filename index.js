/* ==========================================================
   1️⃣ Initialisation de la carte – centre sur le canton de Vaud
========================================================== */
const map = L.map('map').setView([46.55, 6.75], 9); // centre Vaud, zoom 9

map.setMaxBounds([[46, 6], [47.5,7.5]]);
map.setMinZoom(7);
map.setMaxZoom(15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

/* ==========================================================
   2️⃣ Fonctions d’ouverture / fermeture du drawer
========================================================== */
function openSidebar(htmlContent) {
    const sidebar = document.getElementById('sidebar');
    const container = document.getElementById('sidebar-content');
    container.innerHTML = htmlContent;
    sidebar.classList.remove('closed');
}

document.getElementById('closeBtn')
        .addEventListener('click', () => document.getElementById('sidebar')
        .classList.add('closed'));

document.getElementById('openSidebarBtn')
        .addEventListener('click', () => document.getElementById('sidebar')
        .classList.remove('closed'));

/* ==========================================================
   3️⃣ Lecture du CSV et création des marqueurs avec CLUSTERING
========================================================== */
// ✅ Créer le groupe de clusters AVANT de charger les marqueurs
const markerClusterGroup = L.markerClusterGroup({
    // Options personnalisables
    maxClusterRadius: 20,        // Rayon de regroupement (défaut: 80px)
    spiderfyOnMaxZoom: true,     // Déploie en araignée au zoom max
    showCoverageOnHover: true,   // Montre la zone couverte au survol
    zoomToBoundsOnClick: true,   // Zoom sur le cluster au clic
    
    // Personnalisation visuelle des clusters (optionnel)
    iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let size = 'small';
        
        if (count > 10) size = 'medium';
        if (count > 50) size = 'large';
        
        return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
        });
    }
});


/**
 * Parse une ligne CSV simple (sans guillemets contenant des virgules).
 * On utilise la fonction native `String.split(',')` car notre CSV est très basique.
 * Si vous avez des champs contenant des virgules, utilisez une vraie librairie CSV.
 */
function parseCsvLine(line) {
    // Séparer sur les virgules, puis enlever les éventuels espaces autour
    const parts = line.split(',').map(p => p.trim());

    // Les colonnes sont : lat, lng, title, description
    return {
        lat: parseFloat(parts[0]),
        lng: parseFloat(parts[1]),
        title: parts[2],
        description: parts[3].replace(/^"|"$/g, '')   // enlève les guillemets éventuels
    };
}

/**
 * Charge le fichier CSV, le parse et crée les marqueurs.
 * Le fichier `markers.csv` doit être accessible depuis le même répertoire.
 */
async function loadMarkersFromCsv(csvUrl) {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

        const text = await response.text();

        // Séparer les lignes, ignorer la première (en‑tête)
        const lines = text.trim().split('\n');
        const header = lines.shift(); // on ne l’utilise pas, juste pour l’enlever

        lines.forEach(line => {
            // Ignorer les lignes vides
            if (!line.trim()) return;

            const data = parseCsvLine(line);

            // Créer le marqueur Leaflet
            const marker = L.marker([data.lat, data.lng]);
            marker.bindTooltip(data.title, { direction: 'top' });

            // Au clic → ouvrir le drawer avec les infos
            marker.on('click', () => {
                const html = `
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                `;
                openSidebar(html);
            });

            // ✅ AJOUTER le marqueur au groupe de clusters (pas directement à la carte)
            markerClusterGroup.addLayer(marker);
        });

        // ✅ Ajouter TOUS les marqueurs clusterisés à la carte d'un coup
        map.addLayer(markerClusterGroup);
    } catch (err) {
        console.error('Impossible de charger le CSV :', err);
        // Affichage d’un petit message d’erreur dans la sidebar
        openSidebar(`<p style="color:red;">Erreur : impossible de charger les points de repère.</p>`);
    }
}

/* ==========================================================
   4️⃣ Lancer le chargement du CSV
========================================================== */
// Le fichier CSV se trouve dans le même dossier que ce script.
// Vous pouvez changer le chemin si vous le placez ailleurs.
loadMarkersFromCsv('markers.csv');

/* ==========================================================
   5️⃣ Options supplémentaires (facultatives)
========================================================== */
// Désactiver le double‑clic zoom (souvent gênant sur mobile)
map.doubleClickZoom.disable();