var util = Util();

var Tripleg = Tripleg || function(tripleg) {
  this.previousTripleg;
  this.nextTripleg;

  Emitter($.extend(this, tripleg));
  // Make sure that modes are in order
  this._sortModes();
  this._checkIfModeIsAccurateAndSyncToServer();
  // Make sure transitions are in order
  this._sortTransitionPlaces();

  return this;
};

Tripleg.prototype = {

  // Getters
  // -------------------------------------------
  // -------------------------------------------

  getId: function() {
    return this.triplegid;
  },

    getParentTrip: function(){
        return this.trip;
    },

  getMode: function(property) {

    var mode;
    if(this.mode && this.mode.length > 0 && this.mode[0].accuracy > 50) {
      mode = this.mode[0];
      if(property) {
        mode = mode[property] || null;
      }
    }
    return mode;
  },

  getTransition: function(property) {
    var transition;
    if(this.places && this.places.length > 0 && this.places[0].accuracy > 50) {
      transition = this.places[0];
      if(property) {
        transition = transition[property] || null;
      }
    }
    return transition;
  },

  getType: function() {
    return this.type_of_tripleg;
  },

  getStartTime: function(formatted) {
    return util.formatTime(this.start_time, formatted ? CONFIG.default_time_format : false);
  },

  getEndTime: function(formatted) {
    return util.formatTime(this.stop_time, formatted ? CONFIG.default_time_format : false);
  },

  getPrevious: function() {
    return this.previousTripleg;
  },

  getNext: function() {
    return this.nextTripleg;
  },

  getFirstPoint: function() {
    var point;
    if(this.points && this.points.length > 0) {
      point = this.points[0];
    }
    return point;
  },

  getLastPoint: function() {
    var point;
    if(this.points && this.points.length > 0) {
      point = this.points[this.points.length-1];
    }
    return point;
  },

  isAlreadyAnnotated: function() {
    return this.status === 'already_annotated';
  },

  editable: function() {
    return !this.isAlreadyAnnotated();
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
   * Computes the travel time of this trip
   */
  getTravelTime: function() {
      var dateFrom = this.getStartTime();
      var dateTo = this.getEndTime();

      var timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
      var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
      return minutesDiff;
  },

  getColor: function(alpha, low_accuracy_color) {
    var color = CONFIG.triplegs.map.lines.default_color;
    var mode = this.getMode();
    if(mode) {
      if (mode.accuracy < 50){
        color = low_accuracy_color ? low_accuracy_color : CONFIG.triplegs.map.lines.low_accuracy_color;
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

  // Setters
  // -------------------------------------------
  // -------------------------------------------

  setPrevNext: function(previousTripleg, nextTripleg) {
    this.previousTripleg = previousTripleg;
    this.nextTripleg = nextTripleg;
  },

  // Generators
  // -------------------------------------------
  // -------------------------------------------

  generatePolyline: function() {
    var polyline = [];
    var polylineStyle;
    if(this.getType() == 1) {
      // ACTIVE TRIPLEG
      polylineStyle = { color: this.getColor(), weight: CONFIG.triplegs.map.lines.active.weight, opacity: CONFIG.triplegs.map.lines.active.opacity };
    } else {
      // PASSIVE TRIPLEGS
      if(this.points == null || (this.points.length == 1 && this.points[0].id == null )) {
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
/*
    !TODO Add events to map objects
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
      var marker = this._generateMapMarker(point, isFirst, isLast);
      if(marker) {
        points.push(marker);
      }
    }
    return L.featureGroup(points)
  },

  generatePlacePoints: function() {
    var placesPoints = [];
    for (var i = 0; i < this.places.length; i++) {
      var place = this.places[i];
      if(place.accuracy === 100) {
        var marker = this._generateMapMarker(place);
        if(marker) {
          placesPoints.push(marker);
        }
        break;
      }
    }
    return L.featureGroup(placesPoints)
  },

  generateMapLayer: function() {
    this.mapLayer = L.featureGroup();
    this.mapLayer.addLayer(this.generatePolyline());
    this.mapLayer.addLayer(this.generatePoints());
    this.mapLayer.addLayer(this.generatePlacePoints());
    return this.mapLayer;
  },

  // Add a transition place to triplegs local places array
  addTransitionPlace: function(id, name, point) {
    if(this.places === null || typeof this.places === 'undefined') {
      this.places = [];
    }
    this.places.push({
      osm_id: id,
      accuracy: 100,
      added_by_user: true,
      name: name,
      lat: point.lat,
      lon: point.lng
    });
  },

  // API connected
  // -------------------------------------------
  // -------------------------------------------

  updateMode: function(modeId) {
    return api.triplegs.updateMode(this.getId(), modeId)
      .done(function(result) {
        this._setMode(modeId);
        this.emit('tripleg-updated');
        log.debug('Tripleg -> updatedMode', 'tripleg mode succefully updated');
      }.bind(this))
      .fail(function(err, jqXHR) {
        var msg = 'failed to set mode on tripleg';
        log.error('Tripleg -> updateMode', msg, err);
      });
  },

  updateTransitionPoiIdOfTripleg: function(transitionPoiId) {
      var dfd = $.Deferred();

      api.triplegs.updateTransitionPoiIdOfTripleg(this.getId(), transitionPoiId)
      .done(function(result) {
        this._setTransition(transitionPoiId);
        this.emit('tripleg-updated');
        log.debug('Tripleg -> updateTransitionPoiIdOfTripleg', 'tripleg mode succefully updated');
        dfd.resolve(result);
      }.bind(this))
      .fail(function(err, jqXHR) {
        var msg = 'failed to set transition on tripleg';
        log.error('Tripleg -> updateTransitionPoiIdOfTripleg', msg, err);
        dfd.reject(err, jqXHR);
      });
      return dfd.promise();
  },

  // Internal methods
  // -------------------------------------------
  // -------------------------------------------

  _checkIfModeIsAccurateAndSyncToServer: function() {
    var mode = this.getMode();
    // If mode accuracy is set by server then make sure to sync it to the server
    // !TODO move this logic to server?
    if(mode && mode.accuracy > 50 && mode.accuracy < 100) {
      this.updateMode(mode.id);
    }
  },

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
    this.mode = util.sortByAccuracy(this.mode);
  },

  _setTransition: function(transitionPoiId) {
    if(this.places && transitionPoiId) {
      log.info('tripleg setting transition place', transitionPoiId);
      for (var i = 0; i < this.places.length; i++) {
         if(this.places[i].osm_id == transitionPoiId) {
            this.places[i].accuracy = 100;
         } else {
            this.places[i].accuracy = 0;
         }
       };
      this._sortTransitionPlaces();
    }
  },

  _sortTransitionPlaces: function() {
    this.places = util.sortByAccuracy(this.places);
  },

  _generateMapMarker: function(point, isFirstPoint, isLastPoint) {
    var marker;
      var tripleg = this;
    if(point.lat && point.lon) {
      if(this.getType() == 1) {
        // ACTIVE TRIPLEG
        if(this.isFirst && isFirstPoint) {
          // Start point
          marker = L.marker(point, { icon: CONFIG.triplegs.map.markers.start });
        } else if(this.isLast && isLastPoint) {
          // End point
          marker = L.marker(point, { icon: CONFIG.triplegs.map.markers.stop });
        } else if(point.osm_id) {
          // Transfer place, add better way to check?
          marker = L.marker(point, { icon: CONFIG.triplegs.map.markers.transfer });
        } else {
          // Regular point
          marker = L.circleMarker(point, CONFIG.triplegs.map.markers.regular);
            marker.on('click', function _generateMarkerModal(){

                var pointChangeModal =
                    $('<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
                    '<h4 class="modal-title" id="myModalLabel">Change point type</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<label class="radio">' +
                    '<input type="radio" name="inlineRadioOptions" id="inlineRadio1" value="TRANSITION"> This was a transition point' +
                    '</label>' +
                    '<label class="radio">' +
                    '<input type="radio" name="inlineRadioOptions" id="inlineRadio2" value="STOP"> This was a stop point' +
                    '</label>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                    '<button type="button" class="btn btn-primary" id="confirm-change">Accept</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

                pointChangeModal.modal('show');

                pointChangeModal.find('#confirm-change').click(function(e) {

                    var selectedValue = $("input[name=inlineRadioOptions]:checked").val();

                    if (selectedValue){
                        console.log(selectedValue);
                        if (selectedValue === 'TRANSITION')
                            tripleg.getParentTrip().insertTransitionBetweenTriplegs(point.time, point.time, 1, 1);
                        else if (selectedValue === 'STOP')
                            tripleg.getParentTrip().emit('split-trip', point.time, point.time);
                    }

                    pointChangeModal.modal('hide');
                });
            });
        }
      } else if(isFirstPoint || isLastPoint) {
        // PASSIVE TRIPLEGS, only shown for first and last point
        marker = L.marker(point, { icon: CONFIG.triplegs.map.markers.transition });
      } else {
        marker = L.circleMarker(point, CONFIG.triplegs.map.markers.passive_point);
      }
      // Add a tooltip for simpler debugging
      if(marker) {
        var tooltipInfo = util.formatTime(point.time, 'YYYY-MM-DD HH:mm:ss') || point.name;
        if(tooltipInfo) {
          marker.bindTooltip(tooltipInfo);
        }
      }
    }
    return marker;
  }
};