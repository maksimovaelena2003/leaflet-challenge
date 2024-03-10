const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';


// Add a Leaflet tile layer.
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create a Leaflet map object.
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [streets]
});

//define basemaps as the streetmap
let baseMaps = {
    "streets": streets
};

//define the earthquake layergroup and tectonic plate layergroups for the map
let earthquake_data = new L.LayerGroup();


//define the overlays and link the layergroups to separate overlays
let overlays = {
    "Earthquakes": earthquake_data
};

//add a control layer and pass in baseMaps and overlays
L.control.layers(baseMaps, overlays).addTo(myMap);

// Define a function to get color based on depth
function chooseColor(depth){
    if (depth < 10) return "#white";
    else if (depth < 30) return "lightgreen";
    else if (depth < 50) return "green";
    else if (depth < 70) return "darkgreen";
    else if (depth < 90) return "orange";
    else return "red";
}

// Function to set style for each circle marker
function styleInfo(feature) {
    return {
        radius: feature.properties.mag * 4,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "gray",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}


// Define an array to store depth ranges and corresponding colors
let depthRanges = [-10, 10, 30, 50, 70, 90];
let depthColors = ['white', 'lightgreen', 'green', 'darkgreen', 'orange', 'red'];

// Define the createFeatures function to handle earthquake data
function createFeatures(earthquakeData, earthquakeLayer) {
    earthquakeData.forEach(function(feature) {
        const coordinates = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;
        const depth = coordinates[2];

        // Create a circle marker for each earthquake
        L.circleMarker([coordinates[1], coordinates[0]], {
            radius: magnitude * 4, // Set marker size based on magnitude
            fillColor: getColor(depth), // Set marker color based on depth
            color: "whiteblack",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude}<br>Depth: ${depth} km</p>`).addTo(earthquakeLayer);
    });

    // Update legend
    updateLegend();
}

// Define a function to get color based on depth
function getColor(depth) {
    for (let i = 0; i < depthRanges.length; i++) {
        if (depth <= depthRanges[i]) {
            return depthColors[i];
        }
    }
}

d3.json(url).then(function(data) {
    console.log(data.features);
    // Once we get a response, create a GeoJSON layer and add it to the map
    L.geoJSON(data.features, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]} km</p>`);
        }
    }).addTo(myMap);

    // Create legend after GeoJSON layer is added to the map
    updateLegend();
});

function updateLegend() {
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            depthLabels = ['-10', '10', '30', '50', '70', '90+']; 

        // Add legend title
        div.innerHTML += '<strong>Depth Legend</strong><br>';

        // Add legend color squares
        for (var i = 0; i < depthLabels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + depthColors[i + 1] + '"></i> ' +  // Shift the index by 1 to match depthColors
                depthLabels[i] + (depthLabels[i + 1] ? '&ndash;' + depthLabels[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);
}