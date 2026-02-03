// Email Copy Function
window.copyEmail = function(btn) {
    navigator.clipboard.writeText("christianangelchacon@gmail.com").then(function() {
        var tooltip = bootstrap.Tooltip.getInstance(btn);
        var originalTitle = btn.getAttribute('data-bs-original-title') || btn.getAttribute('title');
        
        btn.setAttribute('data-bs-original-title', 'Copied!');
        tooltip.setContent({ '.tooltip-inner': 'Copied!' });
        tooltip.show();
        
        setTimeout(() => {
            btn.setAttribute('data-bs-original-title', originalTitle);
            tooltip.setContent({ '.tooltip-inner': originalTitle });
            tooltip.hide();
        }, 2000);
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap Tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // --- Visitor Map Logic ---
    var targetLat = -33.4489;
    var targetLon = -70.6693;

    // Initialize the map centered on Santiago
    var map = L.map('map', {
        scrollWheelZoom: false, // Disable scroll by default
        dragging: !L.Browser.mobile, // Disable dragging on mobile initially to allow page scroll
        tap: true
    }).setView([targetLat, targetLon], 4);

    // Mobile: Enable dragging with two fingers or after a tap
    if (L.Browser.mobile) {
        map.on('click', function() {
            if (map.dragging.enabled()) {
                map.dragging.disable();
            } else {
                map.dragging.enable();
            }
        });
    }

    // --- Control + Scroll Zoom Logic (Desktop) ---
    map.on('focus', function() { map.scrollWheelZoom.enable(); });
    map.on('blur', function() { map.scrollWheelZoom.disable(); });

    // Enable scroll zoom only when Ctrl key is pressed
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey) {
            map.scrollWheelZoom.enable();
        }
    });

    document.addEventListener('keyup', function(event) {
        if (!event.ctrlKey) {
            map.scrollWheelZoom.disable();
        }
    });

    // Handle dragging: require a click first to prevent hijacking scroll
    map.dragging.disable();
    map.on('mousedown', function() {
        map.dragging.enable();
    });
    map.on('mouseout', function() {
        map.dragging.disable();
    });
    // -----------------------------------

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    L.marker([-33.4489, -70.6693]).addTo(map)
        .bindPopup('<b>Christian Chacón</b><br>Base of Operations: Santiago, Chile');

    // Custom Center Control
    var CenterControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'pointer';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            
            var icon = L.DomUtil.create('i', 'fas fa-crosshairs');
            icon.style.fontSize = '14px';
            icon.style.color = '#333';
            
            container.appendChild(icon);
            container.title = "Center Map to My Location";

            container.onclick = function(){
                map.flyTo([targetLat, targetLon], 5, { animate: true, duration: 1.5 });
            }
            return container;
        }
    });
    map.addControl(new CenterControl());

    // Fetch user's location
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            if (data.latitude && data.longitude) {
                targetLat = data.latitude;
                targetLon = data.longitude;
                map.flyTo([targetLat, targetLon], 5, { animate: true, duration: 2 });
                L.marker([targetLat, targetLon]).addTo(map)
                    .bindPopup(`<b>¡Hola!</b><br>Saludos a nuestros visitantes de ${data.city}, ${data.country_name}.`)
                    .openPopup();
            }
        })
        .catch(error => console.error('Geolocation Error:', error));
});