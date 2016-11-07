
var LMap = LMap || function(mapConfig) {
  // Leaflet map constructor
  var targetElement = 'map';
  if($('body').width() > 700) {
    $('#'+targetElement).height($('#content').height());
  }

  log.debug('UI LMap -> init', 'Map is drawn');

  this.map = new L.Map(targetElement, mapConfig.options);

  // Create layers from config
  var layerControl = L.control.layers();
  for (var i = 0; i < mapConfig.layers.length; i++) {
    var layerConfig = mapConfig.layers[i];
    var layer = L.tileLayer(layerConfig.url, layerConfig.options);
    if(layerConfig.type = 'base') {
      layerControl.addBaseLayer(layer, layerConfig.label);
    } else {
      layerControl.addOverLay(layer, layerConfig.label);
    }
    if(layerConfig.visibleAtStart) {
      layer.addTo(this.map);
    }
  };
  layerControl.addTo(this.map);

  this.map.setView(mapConfig.start.center, mapConfig.zoom);
  return this;
};

LMap.prototype = {

  insertDraggablePoint: function(name) {
    var marker = new L.marker(this.map.getCenter(),{
      draggable: true
    });
    marker.bindTooltip(name);
    marker.addTo(this.map);
    return marker;
  },

  addNewPoint: function() {
    var dfd = $.Deferred();
    new Confirm().show(
      'Add a new point',
      '<label for="poi-name">Name of the palce</label><input type="text" class="form-control" placeholder="Name" name="poi-name" id="poi-name" />',
      function($element) {
        var poiName = $element.find('#poi-name').val();
        var point = this.insertDraggablePoint(poiName);
        point.on("drag", function(e) {
          var marker = e.target;
          var position = marker.getLatLng();
          dfd.resolve(poiName, position);
        });
      }.bind(this));
    return dfd.promise();
  },

  fitBounds: function(bounds) {
    this.map.fitBounds(bounds);
  }



};