var CONFIG = {
  debug: true,

  api_url: '/apiv2',

  map: {
    start: {
      center: [59.340893391583855, 18.00436019897461],
      zoom: 12
    },
    options: {
      maxZoom: 17
    },
    layers: [
      {
        type: 'base',
        visibleAtStart: true,
        label: 'OSM',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          minZoom: 2,
          maxZoom: 24,
          attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }
      },
      {
        type: 'base',
        label: 'ESRI',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      },
      {
        type: 'base',
        label: 'Nightmode',
        url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
          subdomains: 'abcd',
          minZoom: 0,
          maxZoom: 18
        }
      },
      {
        type: 'overlay',
        label: 'Roads',
        url: 'http://{s}.tile.stamen.com/toner-hybrid/{z}/{x}/{y}.png',
        options: {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: 'abcd',
          minZoom: 0,
          maxZoom: 20
        }
      }
    ]
  },

  triplegs: {
    map_markers: {
      regular: {
        radius: 6,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      transition: L.icon({
        iconUrl: 'images/transition.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      stop: L.icon({
        iconUrl: 'images/stop_flag.png',
        iconSize: [30, 30],
        iconAnchor: [10, 10]
      }),
      start: L.icon({
        iconUrl: 'images/start_flag.png',
        iconSize: [30, 30],
        iconAnchor: [10, 10]
      })
    }
  }
};