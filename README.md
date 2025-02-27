# ggr472-lab-03
 
## Contents:

- data/nh_bottom_decile.geojson - the original dataset (has been converted to mapbox vector tileset)
    - data sources: 
        - neighbourhood boundaries - [https://open.toronto.ca/dataset/neighbourhoods/](https://open.toronto.ca/dataset/neighbourhoods/)
        - neighbourhood census statistics - [https://open.toronto.ca/dataset/neighbourhood-profiles/](https://open.toronto.ca/dataset/neighbourhood-profiles/)
    - data processing: 
        - selected single field of interest and transposed data in excel
        - attribute join table to shapefile in ArcGIS Pro
        - export as geoJSON

- index.html - the page structure and elements
- style.css - the page-specific style information
- script.js - handle map and general interactivity