
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

  addNewPoint: function() {
    var dfd = $.Deferred();
    new Confirm().show(
      'Add a new point',
      '<label for="poi-name">Name of the palce</label><input type="text" class="form-control" placeholder="Name" name="poi-name" id="poi-name" />',
      function($element) {
        var poiName = $element.find('#poi-name').val();
        // Set map cursor to marker icon
        $(this.map.getContainer()).css({'cursor': 'url(/images/marker-icon.png) 12 32, default'});
        function mapClicked(e) {
          // remove event handler
          this.map.off('click', mapClicked);
          // Reset cursor
          $(this.map.getContainer()).css({'cursor': 'auto'});
          // resolve with clicked position
          dfd.resolve(poiName, e.latlng);
        }
        // bind map click handler
        this.map.on('click', mapClicked.bind(this));
      }.bind(this));
    return dfd.promise();
  },

  fitBounds: function(bounds) {
    this.map.fitBounds(bounds);
  }



};