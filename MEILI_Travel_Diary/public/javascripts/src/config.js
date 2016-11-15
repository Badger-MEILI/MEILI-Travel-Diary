var CONFIG = {
  debug: true,
  log_level: 'full',

  api_host: '',
  api_url: 'apiv2',

  google_analytics_tracking_id: 'UA-86711356-1',

  default_time_format: 'HH:mm',

  map: {
    start: {
      center: [59.340893391583855, 18.00436019897461],
      zoom: 12
    },
    options: {
      maxZoom: 17,
      scrollWheelZoom: false
    },
    layers: [
      {
        type: 'base',
        visibleAtStart: true,
        label: 'Map',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          minZoom: 2,
          maxZoom: 24,
          attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }
      },
      {
        type: 'base',
        label: 'Satellite',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      },
      {
        type: 'base',
        label: 'Map dark',
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
        label: 'Map roads',
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
    map: {
      lines: {
        low_accuracy_color: '#c25b4e',
        default_color: 'rgb(70,70,70)',
        active: {
          colors: {
            1:  'rgb(31,120,180)', // blue
            2:  'rgb(106,61,154)', // purple
            3:  'rgb(240,2,127)',  // pink
            4:  'rgb(128,0,0)',    // dark red
            5:  'rgb(128,128,0)',  // yellowish
            6:  'rgb(0,128,0)',    // green
            7:  'rgb(128,0,128)',  // purple
            8:  'rgb(0,128,128)',  // turquoise
            9:  'rgb(0,0,128)',    // blue
            10: 'rgb(102,205,170)',// light green
            11: 'rgb(0,255,255)',  // light turquoise
            12: 'rgb(25,25,112)',  // dark blue
            13: 'rgb(138,43,226)', // light purple
            14: 'rgb(218,112,214)',// light pink
            15: 'rgb(244,164,96)'  // orange
          },
          weight: 8,
          opacity: 0.8
        },
        passive: {
          color: 'black',
          weight: 8,
          opacity: 0.6,
          dashArray: '20,15'
        }
      },
      markers: {
        regular: {
          radius: 8,
          fillColor: "#c25b4e",
          color: "#9e4c42",
          weight: 2,
          opacity: 1,
          fillOpacity: 1
        },
        transition: L.icon({
          iconUrl: 'images/transition.png',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        }),
        transfer: L.icon({
          iconUrl: 'images/Bus.png',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        }),
        stop: L.icon({
          iconUrl: 'images/stop_flag.png',
          iconSize: [30, 30],
          iconAnchor: [0, 30]
        }),
        start: L.icon({
          iconUrl: 'images/start_flag.png',
          iconSize: [30, 30],
          iconAnchor: [0, 30]
        }),
        passive_point: {
          radius: 4,
          fillColor: "#000",
          color: "#000",
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.8
        }
      }
    }
  }
};