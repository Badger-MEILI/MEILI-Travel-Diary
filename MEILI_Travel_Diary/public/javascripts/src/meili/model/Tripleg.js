
var Tripleg = Tripleg || function(tripleg) {
  this.previousTripleg;
  this.nextTripleg;

  Emitter($.extend(this, tripleg));
  // Make sure that modes are in order
  this._sortModes();

  return this;
};

Tripleg.prototype = {

    _setMode: function(modeId) {
      log.info('tripleg setting mode', modeId);
      for (var i = 0; i < this.mode.length; i++) {
         if(this.mode[i].id == modeId) {
            this.mode[i].accuracy = 100;
         } else {
            this.mode[i].accuracy = 0;
         }
       };
      this._sortModes();
    },

    _sortModes: function() {
      this.mode = this.mode.sort(function(a,b) {
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
      } else if(!isFirstPoint && !isLastPoint) {
        // PASSIVE TRIPLEGS
        return L.marker(point, { icon: CONFIG.triplegs.map.markers.transition });
      }
      return;
    },

    setPrevNext: function(previousTripleg, nextTripleg) {
      this.previousTripleg = previousTripleg;
      this.nextTripleg = nextTripleg;
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

    getMode: function() {
      var mode;
      if(this.mode && this.mode.length > 0) {
        mode = this.mode[0];
      }
      return mode;
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

    getPrevious: function() {
      return this.previousTripleg;
    },

    getNext: function() {
      return this.nextTripleg;
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

    getColor: function(alpha) {
      var color = CONFIG.triplegs.map.lines.default_color;
      var mode = this.getMode();
      if(mode) {
        if (mode.accuracy < 50){
          color = CONFIG.triplegs.map.lines.low_accuracy_color;
        } else {
          _color = CONFIG.triplegs.map.lines.active.colors[mode.id];
          color = _color ? _color : color;
        }
      }
      if(alpha) {
        // Add alpha to rgb
        color = color.replace(')',','+alpha+')').replace('rgb','rgba');
      }
      return color;
    },

    generatePolyline: function() {
      var polyline = [];
      var polylineStyle;
      if(this.getType() == 1) {
        // ACTIVE TRIPLEG
        polylineStyle = { color: this.getColor(), weight: CONFIG.triplegs.map.lines.active.weight, opacity: CONFIG.triplegs.map.lines.active.opacity };
      } else {
        // PASSIVE TRIPLEGS
        if(this.points == null) {
          this.points = [];
        }
        var previous = this.getPrevious();
        var next = this.getNext();
        if(previous) {
          this.points.push($.extend({}, previous.getLastPoint()));
        }
        if(next) {
          this.points.unshift($.extend({}, next.getFirstPoint()));
        }
        polylineStyle = CONFIG.triplegs.map.lines.passive;
      }

      var polylineLayer = L.polyline(this.points, polylineStyle);

      /**
       * DESKTOP ONLY EVENTS
       */
      console.warn('add events on polyline?');
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
        var marker = this._generateMapMarker(point, isFirst, isLast)
        if(marker) {
          points.push(marker);
        }
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
          this._setMode(modeId);
          this.emit('tripleg-updated');
          log.debug('tripleg mode succefully updated');
        }.bind(this))
        .fail(function() {
          var msg = 'failed to set mode on tripleg';
          alert(msg);
          log.error(msg);
        });
    }
};
