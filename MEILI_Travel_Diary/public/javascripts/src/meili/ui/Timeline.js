
var Timeline = Timeline || function(options) {
  this.elementId = options.elementId;
  this.days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  this.resize();
  $(window).resize(this.resize.bind(this));

  this._addListeners();

  Emitter(this);

  return this;
}

Timeline.prototype = {

  render: function(trip) {
    this.trip = trip;
    // Reset
    $('#'+this.elementId+' > ul').html('');
    this.generateFirstElement();
    var tripLayers = [];
    for (var i=0; i < this.trip.triplegs.length; i++) {
      var tripleg = this.trip.triplegs[i];
      var triplegPanel = new TriplegPanel(this.elementId, this.trip.getId(), tripleg);
      // Bind trip specific events on triplegpanel
      triplegPanel.on('start-time-change',    this._updateStartTime.bind(this));
      triplegPanel.on('end-time-change',      this._updateEndTime.bind(this));
      triplegPanel.on('delete-tripleg',       this.trip.deleteTripleg.bind(this.trip));
      triplegPanel.on('map-zoom-to',          function(bounds) { this.emit('map-zoom-to', bounds); }.bind(this));
      triplegPanel.on('add-new-transportation-poi',  function(tripleg) { this.emit('add-new-transportation-poi', tripleg); }.bind(this));
    }
    this.generateLastElement();
  },

  scrollToTop: function() {
    $('#'+this.elementId).scrollTop(0);
  },

  _updateStartTime: function(tripleg, newStartTime) {
    if(tripleg.isFirst) {
      this.trip.updateStartTime(newStartTime);
    } else {
      this.trip.updateTriplegStartTime(tripleg.getId(), newStartTime);
    }
  },

  _updateEndTime: function(tripleg, newEndTime) {
    if(tripleg.isLast) {
      this.trip.updateEndTime(newEndTime);
    } else {
      this.trip.updateTriplegEndTime(tripleg.getId(), newEndTime);
    }
  },

  _addTime: function(time, hoursMinutes) {
    var hm = hoursMinutes.split(':');
    time.setHours(hm[0]);
    time.setMinutes(hm[1]);
    return time.getTime();
  },

  /**
   * Adds listeners to a timeline element associated with a tripleg and checks for consequences of time change
   * @param tripleg - tripleg
   */
  _addListeners: function(tripId, tripleg) {

    var $element = $('#'+this.elementId);

    // Trip purpose selector
    $element.on('change', '.purpose-selector', function(e) {
      if(e.target.value) {
        this.trip.updatePurposeOfTrip(e.target.value);
      }
    }.bind(this));


    $element.on('change', '.place-selector.destination', function(e) {
      if(e.target.value) {
        if(e.target.value === 'add_new') {
          // add new point
          this.emit('add-new-destination', this);
        } else {
          this.trip.updateDestinationPoiIdOfTrip(e.target.value);
        }
      }
    }.bind(this));

    $element.on('click','.go-to-previous-trip', function(e) {
      this.emit('move-to-previous-trip', this.trip);
      e.preventDefault();
      return false;
    }.bind(this));

    $element.on('click','.go-to-next-trip', function(e) {
      if(this.trip.isAlreadyAnnotated()) {
        this.emit('move-to-next-trip', this.trip);
      } else {
          var safeToMoveToNext = true;
          var errorDisplayMessage = '';
          var tripPurpose = this.trip.getPurpose();
          if (!tripPurpose || (tripPurpose && tripPurpose.accuracy < 50)) {
              safeToMoveToNext = false;
              errorDisplayMessage +=' <strong>trip purpose</strong>';
          }

          var tripDestination = this.trip.getDestinationPlace();
          if (!tripDestination || (tripDestination && tripDestination.accuracy < 50)) {
              safeToMoveToNext = false;
              errorDisplayMessage += ((errorDisplayMessage.length!=0) ? ', ' :' ') + '<strong>trip destination</strong>';
          }

          var allTriplegsOk = true;
          for (var j = 0; j < this.trip.triplegs.length; j++) {
            var tripleg = this.trip.triplegs[j];
            if (tripleg.getType() == 1 && !tripleg.getMode() || (tripleg.getMode() && tripleg.getMode().accuracy < 50)) {
                safeToMoveToNext = false;
                allTriplegsOk = false;
            }
          }

          if (!allTriplegsOk)
          errorDisplayMessage += ((errorDisplayMessage.length!=0) ? ', ' : ' ') + '<strong>tripleg travel mode</strong>';

          errorDisplayMessage = 'Please specify the following:' +errorDisplayMessage;
              if (safeToMoveToNext)
        new Confirm().show({ heading: 'Complete trip annotation', question: 'Do you really want to complete the annotations for this trip and move to the next trip?' }, function() {
          this.trip.confirm();
        }.bind(this));
         else new Confirm().show({ heading: 'Insufficient trip information', question: errorDisplayMessage, type: 'error' }, function() {
          }.bind(this));
      }
      e.preventDefault();
      return false;
    }.bind(this));

    $element.on('click', '.delete-trip', function(e) {
      new Confirm().show({ heading: 'Delete trip', question: 'Do you really want to delete this trip?' }, function() {
        this.emit('delete-trip', this.trip);
      }.bind(this));
      e.preventDefault();
      return false;
    }.bind(this));


    $element.on('click', '.merge-with-next-trip', function(e) {
      new Confirm().show({ heading: 'Merge trip', question: 'Do you really want to merge this trip with next trip?' }, function() {
        this.emit('merge-trip', this.trip);
      }.bind(this));
      e.preventDefault();
      return false;
    }.bind(this));

  },

    /**
   * Generates the first timeline element and adds it at the head of the timeline
   */
  generateFirstElement: function(){
      var ul = $('#'+this.elementId+' > ul');

      var previousPurpose = this.trip.getPreviousTripPurpose();
      var previousPlace = this.trip.getPreviousTripPOIName();
      var previousTripEndDate = this.trip.getPreviousTripEndTime();
      var currentTripStartDate = this.trip.getStartTime();
      var timeDiff = this.trip.getTimeDiffToPreviousTrip();


      if (previousPurpose!=null) {
          /* Add see previous button */
          var navigateToPreviousTrip = [
              '<li>',
                '<div class="tldatecontrol" id="seePrevious">',
                  '<a class="go-to-previous-trip" href="#" lang="en"><i class="glyphicon medium glyphicon-arrow-left"></i> See previous trip</a>',
                '</div>',
              '</li>'
          ];
          ul.append(navigateToPreviousTrip.join(''));

          var previousTripEndDateLocal = moment(this.trip.getPreviousTripEndTime()).format('dddd, YYYY-MM-DD');

          /* Add previous trip ended panel*/
          var previousTripPanel = [
            '<li>',
              '<div class="tldate previous" style="width:330px"> <p lang="en"><strong>' + this.trip.getPreviousTripEndTime(true) +'</strong> ('+previousTripEndDateLocal  +') - Previous trip ended</p>',
              '</div>',
            '</li>'
          ];
          ul.append(previousTripPanel.join(''));

          /* Add previous trip summary */
          var previousTripSummaryPanel = [
            '<li class="timeline-inverted">',
              '<div class="timeline-panel previous">',
                '<div class="tl-heading">',
                  '<strong>Previous trip summary</strong>',
                '</div>',
                '<div class="tl-body">',
                  '<div id="tldatefirstparagraph">',
                    '<small class="text-muted">',
                      '<i class="glyphicon glyphicon-time"></i> '+this.trip.getPreviousTripEndTime(true)+' - '+this.trip.getStartTime(true),
                    '</small>',
                  '</div>',
                  '<div lang="en">Place: '+previousPlace+'</div>',
                  '<div lang="en">Purpose: '+previousPurpose+'</div>',
                '</div>',
              '</div>',
            '</li>'
            ];
          ul.append(previousTripSummaryPanel.join(''));
      } else {
          var firstTimePanel = [
            '<li>',
              '<div class="tldate init" id="firstTimelinePanel">',
                '<p lang="en">This is where you started using MEILI</p>',
              '</div>',
            '</li>'
          ];
          ul.append(firstTimePanel.join(''));
      }
      /* Add started trip info */
      var currentTripStartDateLocal = moment(currentTripStartDate).format('dddd')+", "+moment(currentTripStartDate).format("YYYY-MM-DD");
      var currentTripStartHour = moment(currentTripStartDate).format("hh:ss");

      var tripStartPanel = [
        '<li>',
          '<div class="tldate start row" id="tldatefirst">',
            '<div class="col-md-1">',
              '<span class="glyphicon glyphicon-flag large"></span>',
            '</div>',
            '<div class="col-md-7">',
              '<span class="important-time">'+ this.trip.getStartTime(true) +'</span> <small>('+ currentTripStartDateLocal  +')</small> - <strong>Started trip</strong>',
            '</div>',
            '<div class="col-md-4 controls">',
              this._generateDeleteTripButton(this.trip),
            '</div>',
          '</div>',
        '</li>'
      ];

      ul.append(tripStartPanel.join(''));
  },

  _generateDeleteTripButton: function(trip) {
    if(trip.editable()) {
      return '<button class="delete-trip btn btn-default" lang="en"><span class="glyphicon glyphicon-trash"></span> Delete trip</button>';
    } else {
      return '';
    }
  },

  _generateMergeTripsButton: function(trip) {
    if(trip.editable() && this.trip.getNextTripStartTime() && this.trip.getNextTripStartTime() !== null) {
      return '<button class="merge-with-next-trip btn btn-default" lang="en">Merge with next trip <span class="glyphicon glyphicon-share-alt"></span></button>';
    } else {
      return '';
    }
  },

  _generateViewElement: function(label, value) {
    htmlStr = '';
    if(value) {
      htmlStr = '<label>' + label + '</label>' +
             '<p class="form-control-static">'+ value + '</p>';
    }
    return htmlStr;
  },

  /**
   * Generates the last timeline element and adds it at the tail of the timeline
   */
  generateLastElement: function(){
      var ul = $('#'+this.elementId+' > ul');

      var currentTripEnd = this.trip.getEndTime();
      var currentTripEndDateLocal = moment(currentTripEnd).format('dddd')+", "+moment(currentTripEnd).format("YYYY-MM-DD");

      var lastTimelineElement = [
        '<li>',
          '<div class="tldate end row" id="tldatelast">',
            '<div class="col-md-1">',
              '<span class="glyphicon glyphicon-flag large"></span>',
            '</div>',
            '<div class="col-md-7">',
              '<span class="important-time">'+ this.trip.getEndTime(true) +'</span> <small>('+currentTripEndDateLocal  +')</small> - <strong>Ended trip</strong>',
            '</div>',
            '<div class="col-md-4 controls">',
              this._generateMergeTripsButton(this.trip),
            '</div>',
          '</div>',
        '</li>'
      ];

      ul.append(lastTimelineElement.join(''));


      // Add ended trip info
      // TODO! move into separate method
      var displayTripEndTime = this.trip.getEndTime(true);
      if (this.trip.getNextTripStartTime() && this.trip.getNextTripStartTime() !== null) {
          // Add previous trip ended panel
          displayTripEndTime = this.trip.getEndTime(true) + ' - ' + this.trip.getNextTripStartTime(true);
      }

      var lastTripControl = [
        '<li class="timeline-inverted">',
          '<div class="timeline-panel" id="lastTimelinePanel">',
            '<div class="tl-heading">',
              '<h4 lang="en">End of trip</h4>',
              '<p id="tldatelastparagraph">',
                '<small class="text-muted"><i class="glyphicon glyphicon-time"></i> ' + displayTripEndTime + ', ' + this.trip.getTimeDiffToNextTrip() + ' hours to next trip start</small>',
              '</p>',
            '</div>',
            '<div class="tl-body">',
              this.generateDestinationPlaceSelector(this.trip),
              this.generatePurposeSelector(this.trip),
            '</div>',
          '</div>',
        '</li>'
      ];

      ul.append(lastTripControl.join(''));


      // Navigation to next trip
      // TODO! move into separate method
      var moveToNextTripLabel = 'Annotate last trip';
      if (this.trip.getNextTripStartTime() && this.trip.getNextTripStartTime() !== null) {
        moveToNextTripLabel = 'Process the next trip';
      }

      /* Add process next trip */
      navigateToNextTrip = [
        '<li id="processNext">',
          '<div class="tldatecontrol">',
            '<a class="go-to-next-trip" href="#" lang="en">' + moveToNextTripLabel + ' <i class="glyphicon medium glyphicon-arrow-right"></i> </a>',
          '</div>',
        '</li>'];
      ul.append(navigateToNextTrip.join(''));

  },

  /**
   * Generates a selector for the places (for destination) associated to a trip
   * @param places - array of places (lat, lon) that have accuracy of inference embedded
   * @returns {string|string} - outerHTML of the place selector
   */
  generateDestinationPlaceSelector: function(trip) {
    var elementHtml = '';
    var label = 'Destination of trip';
    var places = trip.getPlaces();
    if (places && $.isArray(places)) {
      if(trip.editable()) {
        var placeSelector = [];
        var selectorOptions = [];
        var specifyOptionLabel = 'Specify your destination';
        var classes = '';

        for (var i=0; i < places.length; i++) {
          var place = places[i];
          var id = place.gid;
          var type = place.type ? ' ('+place.type+')' : '';
          if (id !== undefined) {
            selectorOptions.push('<option value="' + id + '">' + place.name + type + '</option>');
          }
        }

          var maxAccuracy =0;
          if(places.length>0)
            maxAccuracy = places[0].accuracy;

        if (maxAccuracy < 50) {
          // Can not preselect for the user
          classes = ' form-value-invalid';
          selectorOptions.unshift('<option value="-1" disabled selected lang="en">' + specifyOptionLabel + '</option>');
        }

        selectorOptions.push('<option value="add_new">Add new ...</option>');

        placeSelector = ['<p lang="en">',
                          '<label for="place-selector">' + label + '</label>',
                          '<div>',
                          '<select class="form-control form-control-inline place-selector destination' + classes + '">',
                            selectorOptions.join(''),
                          '</select></p>',
                          '</div>'];
        elementHtml = placeSelector.join('');
      } else {
        elementHtml = this._generateViewElement(label, trip.getDestinationPlace('name'));
      }
    }
    return elementHtml;
  },

  /**
   * Generates a selector for the purposes associated with a trip
   * @param purposes - an array of purposes and their inference certainty
   * @returns {string|string} outerHTML of the purpose selector
   */
  generatePurposeSelector: function(trip) {
    var elementHtml = '';
    var label = 'Purpose of trip:';
    var purposes = trip.getPurposes();
    if(purposes && purposes.length > 0) {
      if(trip.editable()) {
        var purposeSelector = '';
        var maxAccuracy = purposes[0].accuracy;
        var purposeOptions = [];
        var classes = '';

        // Accuracy is not high enough to preselect for the user
        if (maxAccuracy < 50){
          classes = ' form-value-invalid';
          purposeOptions.push('<option value="-1" lang="en" disabled selected>Specify your trip\'s purpose</option>')
        }

        for (var i=0; i < purposes.length; i++){
          var purpose = purposes[i];
          purposeOptions.push('<option value="' + purpose.id + '" lang="en">' + purpose.name + '</option>');

        }

        purposeSelector = '<p lang="en">' +
                                '<label for="purpose-selector">' + label + '</label>'+
                                '<div>' +
                                  '<select class="form-control form-control-inline form-need-check purpose-selector ' + classes + '">' +
                                    purposeOptions.join('');
                                  '</select>' +
                                '</div>' +
                              '</p>';
        elementHtml = purposeSelector;
      } else {
        elementHtml = this._generateViewElement(label, trip.getPurpose('name'));
      }
    }
    return elementHtml;
  },

  resize: function() {
    $('#'+this.elementId).height($('#content').height()+'px');
  }

};