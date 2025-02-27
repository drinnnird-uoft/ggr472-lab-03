mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbm5pcmQiLCJhIjoiY201b2RyYXRhMGt1YTJvcHQ4ZjU4dDYycSJ9.jHNRKSu149-F5s157m1GwA'; // Add default public map token from your Mapbox account
const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/drinnird/cm7mp3p39015s01qoa147enws', // style URL
    center: [-79.38, 43.70], // starting position [lng, lat]
    zoom: 10
});

map.on('load', () => {
    // add vector tileset
    // nh-data is neighbourhood polygons for Toronto with census data attached
    map.addSource('nh-data', {
        type: 'vector',
        url: 'mapbox://drinnird.33zzryqm' 
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
                ['get', 'Percent_in'], // GET expression retrieves property value from 'population' data field
                '#f2f0f7', // Colour assigned to any values < first step
                0.09, '#cbc9e2', // Colours assigned to values >= each step
                0.14, '#9e9ac8',
                0.18, '#756bb1',
                0.25, '#54278f'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'white'
        },
        'source-layer': 'nh_bottom_decile-42s87v'
    })

    
    // Change the cursor to a pointer when
    // the mouse is over the states layer.
    map.on('mouseenter', 'nh-poly', (e) => {
        map.getCanvas().style.cursor = 'pointer';
    });
    // create dynamically generated popups based on the properties set in the vector tile for each polygon
    map.on('click', 'nh-poly', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.AREA_DE8 + ' - ' + e.features[0].properties.Percent_in)
            .addTo(map);
    } )

    // Change the cursor back to a pointer
    // when it leaves the states layer.
    // hide the popups when the mouse stops hovering over a location
    map.on('mouseleave', 'nh-poly', () => {
        map.getCanvas().style.cursor = '';
    });
    
});