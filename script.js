mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbm5pcmQiLCJhIjoiY201b2RyYXRhMGt1YTJvcHQ4ZjU4dDYycSJ9.jHNRKSu149-F5s157m1GwA'; // Add default public map token from your Mapbox account
const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/drinnird/cm7mp3p39015s01qoa147enws', // style URL
    center: [-79.38, 43.70], // starting position [lng, lat]
    zoom: 10
});

// construct and add the legend
//Declare array variables for labels and colours
const legendlabels = [
    '0-9%',
    '9-14%',
    '14-18%',
    '18-25%',
    '>25%'
];

const legendcolours = [
    '#f2f0f7',
    '#cbc9e2',
    '#9e9ac8',
    '#756bb1',
    '#54278f'
];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

//For each layer create a block to put the colour and label in
legendlabels.forEach((label, i) => {
    const colour = legendcolours[i];

    const item = document.createElement('div'); //each layer gets a 'row' - this isn't in the legend yet, we do this later
    const key = document.createElement('span'); //add a 'key' to the row. A key will be the colour circle

    key.className = 'legend-key'; //the key will take on the shape and style properties defined in css
    key.style.backgroundColor = colour; // the background color is retreived from teh layers array

    const value = document.createElement('span'); //add a value variable to the 'row' in the legend
    value.innerHTML = `${label}`; //give the value variable text based on the label

    item.appendChild(key); //add the key (colour cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});

let hoveredPolygonId = null; // set variable to hold ID of polygon hovered on, initialize to null

const returnbutton = document.getElementById("returnbutton")

returnbutton.addEventListener('click', (e) => {
    map.flyTo({
        center: [-79.38, 43.70],
        zoom: 10,
        essential: true
    })
})

map.on('load', () => {
    // add vector tileset
    // nh-data is neighbourhood polygons for Toronto with census data attached
    map.addSource('nh-data', {
        type: 'vector',
        url: 'mapbox://drinnird.33zzryqm',
        "promoteId": {"nh_bottom_decile-42s87v": "nh_code"} // assign unique IDs from neighbourhood ID because there was a bug in auto-generated unique IDs
    });
    // draw features from vector tileset

    // shade in provincial neighbourhoods by percent in bottom income decile
    map.addLayer({
        'id': 'nh-poly',
        'type': 'fill',
        'source': 'nh-data',
        'paint': {
            'fill-color':         [
                'step', // STEP expression produces stepped results based on value pairs
                ['*',['get', 'Percent_in'],100], // GET expression retrieves property value from 'Percent_id' data field
                '#f2f0f7', // Colour assigned to any values < first step
                9, '#cbc9e2', // Colours assigned to values >= each step
                14, '#9e9ac8',
                18, '#756bb1',
                25, '#54278f'
            ],
            'fill-opacity': [ // set the fill opacity based on a feature state which is set by a hover event listener
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,  // opaque when hovered on
                0.5 // semi-transparent when not hovered on
            ],
            'fill-outline-color': 'white'
        },
        'source-layer': 'nh_bottom_decile-42s87v'
    })

    // create dynamically generated popups based on the properties set in the vector tile for each polygon
    map.on('click', 'nh-poly', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.AREA_DE8 + ' - ' + (parseFloat(e.features[0].properties.Percent_in)*100).toFixed(2) + '%')
            .addTo(map);
        let feature = e.features[0] // grab the feature clicked on
        let polygon = turf.polygon(feature.geometry.coordinates) // create a turf polygon from the clicked on feature
        let centroid = turf.centroid(polygon) // calculate the centroid of the polygon
        map.flyTo({center: centroid.geometry.coordinates, zoom:12}); // zoom in on the centroid of the clicked polygon
    } )


    // When the user moves their mouse over the nh-poly layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', 'nh-poly', (e) => {
        map.getCanvas().style.cursor = 'pointer'; // update the mouse cursor to a pointer to indicate clickability
        if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    // must provide sourceLayer name when using a vector tileset for this function
                    { source: 'nh-data', sourceLayer: 'nh_bottom_decile-42s87v', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = e.features[0].id;
            map.setFeatureState(
                { source: 'nh-data', sourceLayer: 'nh_bottom_decile-42s87v', id: hoveredPolygonId },
                { hover: true }
            );
        }
    });

    // When the mouse leaves the nh-poly layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'nh-poly', () => {
        map.getCanvas().style.cursor = ''; // put the mouse cursor back to default
        if (hoveredPolygonId !== null) {
            map.setFeatureState(
                { source: 'nh-data', sourceLayer: 'nh_bottom_decile-42s87v', id: hoveredPolygonId },
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    });
    
});