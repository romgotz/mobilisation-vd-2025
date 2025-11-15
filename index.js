/* ==========================================================
   1️⃣ Initialisation de la carte – centre sur le canton de Vaud
========================================================== */
const map = L.map('map').setView([46.55, 6.75], 9); // centre Vaud, zoom 9

map.setMaxBounds([[46, 6], [47.5, 7.5]]);
map.setMinZoom(7);
map.setMaxZoom(15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

/* ==========================================================
   2️⃣ Définition des icônes personnalisées
========================================================== */

// Icône bleue par défaut (type "lieu")
const blueIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icône orange (type "action")
const orangeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

/* ==========================================================
   3️⃣ Groupes de clusters séparés par type
========================================================== */

// Cluster pour type "lieu" (bleu)
const clusterGroupA = L.markerClusterGroup({
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 50) size = 'large';
        
        return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size} cluster-blue`,
            iconSize: L.point(40, 40)
        });
    }
});

// Cluster pour type "action" (orange)
const clusterGroupB = L.markerClusterGroup({
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 50) size = 'large';
        
        return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size} cluster-orange`,
            iconSize: L.point(40, 40)
        });
    }
});

// Ajouter les deux groupes à la carte par défaut
map.addLayer(clusterGroupA);
map.addLayer(clusterGroupB);

/* ==========================================================
   4️⃣ Fonctions d'ouverture / fermeture du drawer
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
   5️⃣ Contrôle de filtres intégré à Leaflet
========================================================== */

// Créer un contrôle personnalisé Leaflet
L.Control.FilterControl = L.Control.extend({
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        
        container.style.backgroundColor = 'white';
        container.style.padding = '10px';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        container.style.transition = 'all 0.3s ease-in-out';
        
     container.innerHTML = `
            <button id="toggleFilters" style="
                display: none;
                width: 100%;
                padding: 8px;
                margin-bottom: 8px;
                background: #0066ff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            ">🔽 Filtres</button>
            <div id="filterContent">
                <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Filtres</div>
                <label style="display: flex; align-items: center; gap: 6px; margin: 6px 0; cursor: pointer; user-select: none;">
                    <input type="checkbox" id="filterA" checked style="cursor: pointer;">
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png" 
                         style="width: 15px; height: 25px; display: inline-block;" 
                         alt="Marqueur bleu">
                    <span style="font-size: 13px;">Lieu mobilisé</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; margin: 6px 0; cursor: pointer; user-select: none;">
                    <input type="checkbox" id="filterB" checked style="cursor: pointer;">
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png" 
                         style="width: 15px; height: 25px; display: inline-block;" 
                         alt="Marqueur orange">
                    <span style="font-size: 13px;">Action durant la journée</span>
                </label>
            </div>
        `;
        
        // Empêcher la propagation des clics sur la carte
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        return container;
    },
    
    onRemove: function(map) {
        // Rien à faire ici
    }
});

// Ajouter le contrôle à la carte
L.control.filterControl = function(opts) {
    return new L.Control.FilterControl(opts);
}

L.control.filterControl({ position: 'topleft' }).addTo(map);

// Fonction de mise à jour des filtres
function updateFilters() {
    const showA = document.getElementById('filterA').checked;
    const showB = document.getElementById('filterB').checked;

    // Afficher ou masquer les clusters selon les cases cochées
    if (showA) {
        if (!map.hasLayer(clusterGroupA)) {
            map.addLayer(clusterGroupA);
        }
    } else {
        if (map.hasLayer(clusterGroupA)) {
            map.removeLayer(clusterGroupA);
        }
    }

    if (showB) {
        if (!map.hasLayer(clusterGroupB)) {
            map.addLayer(clusterGroupB);
        }
    } else {
        if (map.hasLayer(clusterGroupB)) {
            map.removeLayer(clusterGroupB);
        }
    }
}

// Attendre que le contrôle soit ajouté avant d'attacher les événements
setTimeout(() => {
    document.getElementById('filterA').addEventListener('change', updateFilters);
    document.getElementById('filterB').addEventListener('change', updateFilters);
    
    // Gestion du bouton toggle sur mobile
    const toggleBtn = document.getElementById('toggleFilters');
    const filterContent = document.getElementById('filterContent');
    let filtersExpanded = true;
    
    toggleBtn.addEventListener('click', () => {
        filtersExpanded = !filtersExpanded;
        if (filtersExpanded) {
            filterContent.style.display = 'block';
            toggleBtn.innerHTML = '🔽 Filtres';
        } else {
            filterContent.style.display = 'none';
            toggleBtn.innerHTML = '▶️ Filtres';
        }
    });
}, 100);

/* ==========================================================
   6️⃣ Lecture du CSV et création des marqueurs
========================================================== */

/**
 * Parse une ligne CSV en tenant compte des guillemets.
 * Les colonnes sont : lat, lng, title, description, type
 */
function parseCsvLine(line) {
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current.trim()); // Ajouter le dernier champ

    return {
        lat: parseFloat(parts[0]),
        lng: parseFloat(parts[1]),
        title: parts[2],
        description: parts[3].replace(/^"|"$/g, ''), // Retirer les guillemets
        type: parts[4] ? parts[4].trim() : 'lieu'
    };
}

/**
 * Charge le fichier CSV, le parse et crée les marqueurs colorés.
 */
async function loadMarkersFromCsv(csvUrl) {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

        const text = await response.text();

        // Séparer les lignes, ignorer la première (en-tête)
        const lines = text.trim().split('\n');
        const header = lines.shift();

        lines.forEach(line => {
            // Ignorer les lignes vides
            if (!line.trim()) return;

            const data = parseCsvLine(line);

            // Choisir l'icône selon la valeur de "type"
            const icon = data.type === 'action' ? orangeIcon : blueIcon;

            // Créer le marqueur avec l'icône appropriée
            const marker = L.marker([data.lat, data.lng], { icon: icon });
            marker.bindTooltip(data.title, { direction: 'top' });

            // Au clic → ouvrir le drawer avec les infos
            marker.on('click', () => {
                const actionLabel = data.type === 'action' ? 'Action durant la journée' : 'Lieu mobilisé';
                const actionColor = data.type === 'action' ? '#ff8c00' : '#2196F3';
                
                // Convertir les | en <br> pour les retours à la ligne
                const formattedDescription = data.description.replace(/\|/g, '<br>');
                
                const html = `
                    <h2>${data.title}</h2>
                    <p style="color: ${actionColor}; font-weight: bold; margin: 10px 0;">
                        🏠 ${actionLabel}
                    </p>
                    <p>${formattedDescription}</p>
                `;
                openSidebar(html);
            });

            // Ajouter le marqueur au bon groupe de clusters
            if (data.type === 'action') {
                clusterGroupB.addLayer(marker);
            } else {
                clusterGroupA.addLayer(marker);
            }
        });

        console.log(`✅ ${clusterGroupA.getLayers().length} marqueurs "lieu" chargés`);
        console.log(`✅ ${clusterGroupB.getLayers().length} marqueurs "action" chargés`);

    } catch (err) {
        console.error('Impossible de charger le CSV :', err);
        openSidebar(`<p style="color:red;">Erreur : impossible de charger les points de repère.</p>`);
    }
}

/* ==========================================================
   7️⃣ Lancer le chargement du CSV
========================================================== */
loadMarkersFromCsv('markers.csv');

/* ==========================================================
   8️⃣ Options supplémentaires (facultatives)
========================================================== */
map.doubleClickZoom.disable();
