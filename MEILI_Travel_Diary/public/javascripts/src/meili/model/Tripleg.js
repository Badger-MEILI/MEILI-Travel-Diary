
var Tripleg = Tripleg || function(tripleg) {

  tripleg.mode = tripleg.mode.sort(function(a,b) {
    if (a.accuracy < b.accuracy) {
        return 1;
    }

    if (a.accuracy > b.accuracy) {
        return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return -1;
  });

  this.colors = {
    1:  'rgb(31,120,180)',
    2:  'rgb(106,61,154)',
    3:  'rgb(240,2,127)',
    4:  'rgb(128,0,0)',
    5:  'rgb(128,128,0)',
    6:  'rgb(0,128,0)',
    7:  'rgb(128,0,128)',
    8:  'rgb(0,128,128)',
    9:  'rgb(0,0,128)',
    10: 'rgb(102,205,170)',
    11: 'rgb(0,255,255)',
    12: 'rgb(25,25,112)',
    13: 'rgb(138,43,226)',
    14: 'rgb(218,112,214)',
    15: 'rgb(244,164,96)'
  };

  Emitter($.extend(this, tripleg));

  return this;
};

Tripleg.prototype = {

    _setMode: function(modeId) {
      for (var i = 0; i < this.mode.length; i++) {
         if(this.mode[i].id === modeId) {
            this.mode[i].accuracy = 100;
         } else {
            this.mode[i].accuracy = 0;
         }
       };
    },

    _generateMapMarker: function(point, isFirstPoint, isLastPoint) {
      if(this.getType() == 1) {
        // ACTIVE TRIPLEG
        if(this.isFirst && isFirstPoint) {
          // Start point
          return L.marker(point, { icon: CONFIG.triplegs.map.markers.start });
        } else if(this.isLast && isLastPoint) {
          // End point
          return L.marker(point, { icon: CONFIG.triplegs.map.markers.stop });
        } else {
          // Regular point
          return L.circleMarker(point, CONFIG.triplegs.map.markers.regular);
        }
      } else {
        // PASSIVE TRIPLEGS
        return L.marker(point, { icon: CONFIG.triplegs.map.markers.transition });
      }
    },

    getFirstPoint: function() {
      return this.points[0];
    },

    getLastPoint: function() {
      return this.points[this.points.length-1];
    },

    formatDate: function(triplegDate) {
      return (triplegDate.getHours() < 10 ? '0' : '') + triplegDate.getHours() +
              ':' +
              (triplegDate.getMinutes() < 10 ? '0' : '') + triplegDate.getMinutes()
    },

    getId: function() {
      return this.triplegid;
    },

    getType: function() {
      return this.type_of_tripleg;
    },

    getStartTime: function(formatted) {
      var startTime = new Date(this.start_time);
      return formatted ? this.formatDate(startTime) : startTime;
    },

    getEndTime: function(formatted) {
      var endTime = new Date(this.stop_time);
      return formatted ? this.formatDate(endTime) : endTime;
    },

    /**
     * Computes the distance in kilometers of a tripleg and returns it as a string
     * @param triplegid - the id of the tripleg for which the distance has to be computed
     * @returns {string} - the distance in kilometers as a string
     */

    getDistance: function() {
      //TODO change this to reflect values in meters too
      var initDist = 0;
      var prevPoint = L.latLng(0,0);
      for (var i=0; i < this.points.length; i++){
        var derivedPoint = L.latLng(this.points[i].lon, this.points[i].lat);
        if (prevPoint.lat != 0){
          initDist = initDist+ derivedPoint.distanceTo(prevPoint);
        }
        prevPoint.lat = derivedPoint.lat;
        prevPoint.lng = derivedPoint.lng;
      }
      var distance;
      if(initDist < 1000) {
        distance = (Math.round(initDist/100)*100)+' m';
      } else {
        distance = Math.round(initDist/1000) +' km';
      }
      return distance;
    },

    /**
     * Computes the transition time to the next tripleg element
     * @param triplegid - the id of the tripleg from which the transition time will be computed
     * @returns {string|string} - the outerHTML of a paragraph that contains the transition time in minutes
     */
    getTransitionTime: function() {
      if(this.isLast) {
        return;
      } else {
        var dateFrom = this.getStartTime();
        var dateTo = this.getEndTime();

        var timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
        var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
        return minutesDiff;
      }
    },

    getColor: function() {
      var color = CONFIG.triplegs.map.lines.default_color;
      if (this.mode[0].accuracy < 50){
        color = CONFIG.triplegs.map.lines.low_accuracy_color;
      } else {
        _color = this.colors[this.mode[0].id];
        color = _color ? _color : color;
      }
      return color;
    },

    generatePolyline: function() {
      var polyline = [];
      var polylineStyle;

      if(this.type_of_tripleg == 1) {
        // ACTIVE TRIPLEG
        polylineStyle = { color: this.getColor(this.mode), weight: CONFIG.triplegs.map.lines.active.weight, opacity: CONFIG.triplegs.map.lines.active.opacity };
      } else {
        // PASSIVE TRIPLEGS
        if(this.points == null) {
          this.points = [];
          this.points.push(jQuery.extend(true,{},this.getPrevPassive().getLastPoint()))
          this.points.push(jQuery.extend(true,{},this.getNextPassive().getFirstPoint()));
        }
        polylineStyle = CONFIG.triplegs.map.lines.passive;
      }

      var polylineLayer = L.polyline(this.points, polylineStyle);

      /**
       * DESKTOP ONLY EVENTS
       */
      console.warn('add events?');
/*
      if(this.type_of_tripleg == 1) {
        // ACTIVE TRIPLEG
        polylineLayer.on('mouseover', highlightFeature);
        polylineLayer.on('mouseout', resetHighlight);
        polylineLayer.on('click', scrollToTimeline);
        polylineLayer.on('dblclick', addPointToPolyline);
      } else {
        // PASSIVE TRIPLEG
        polylineLayer.on('mouseover', highlightPassiveFeature);
        polylineLayer.on('mouseout', resetPassiveHighlight);
        polylineLayer.on('click', scrollToPassiveTimeline);
      }
*/
      // Store references
      polylineLayer.this = this;
      this.polylineLayer = polylineLayer;

      return polylineLayer;

    },

    generatePoints: function() {
      var points = [];
      for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        var isFirst = (i === 0);
        var isLast = (i === this.points.length-1);
        points.push(this._generateMapMarker(point, isFirst, isLast));
      }
      return L.featureGroup(points)
    },

    generateMapLayer: function() {
      this.mapLayer = L.featureGroup();
      this.mapLayer.addLayer(this.generatePolyline());
      this.mapLayer.addLayer(this.generatePoints());
      return this.mapLayer;
    },

    updateMode: function(modeId) {
      api.triplegs.updateMode(this.getId(), modeId)
        .done(function() {
          this._setMode(this.value);
          log.debug('tripleg mode succefully updated');
        }.bind(this))
        .fail(function() {
          var msg = 'failed to set mode on tripleg';
          alert(msg);
          log.error(msg);
        });
    }
};
