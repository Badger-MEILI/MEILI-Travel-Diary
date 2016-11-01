
var LMap = LMap || function() {
  return this;
};

LMap.prototype = {

  /**
   * Populates layers - gets called on new trip only
   */
    init: function(mapConfig, userId) {
      var targetElement = 'map';
      $('#'+targetElement).height($('#content').height());

      log.debug(userId, 'the map is drawn');

      map = new L.Map(targetElement, mapConfig.options);

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
          layer.addTo(map);
        }
      };
      layerControl.addTo(map);

      map.setView(mapConfig.start.center, mapConfig.zoom);

    }

};