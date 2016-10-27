
var Timeline = Timeline || function(options) {
  this.elementId = options.elementId;
  this.days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  this.resize();
  $(window).resize(this.resize.bind(this));

  this.initiateModals();

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
      this.generateElement(this.trip.getId(), tripleg);
    }
    this.generateLastElement();
},

  _onTimeSet: function(e) {

    var $target = $(e.target);
    var triplegId = parseInt($target.attr('tripleg-id'), 10);
    var initialTime = parseInt($target.attr('initial-time'), 10);
    var initialTimeDate = new Date(initialTime);

    var newTime = new Date(initialTime);
    newTime.setMinutes(e.time.minutes);
    newTime.setHours(e.time.hours);
    newTime = newTime.getTime();

    log.info('changed timepicker start value of tripleg '+ triplegId +' to '+ newTime);

    if(initialTime != newTime) {
      if ($target.hasClass('start')) {
        this.emit('start-time-change', triplegId, newTime);
      } else if($target.hasClass('end')) {
        this.emit('end-time-change', triplegId, newTime);
      }
    } else {
      $target.timepicker('setTime', initialTimeDate.getHours()+":"+initialTimeDate.getMinutes());
    }

    e.preventDefault();
  },

  /**
   * Returns the outerHTML of a MODE selector
   * @param mode - an array containing mode ids and their inference confidence
   * @param triplegid - the id of the tripleg with which the modes are associated with
   * @returns {string} - outerHTML of the mode selector
   */
  _getModeSelector: function(tripleg){
      var maxVal = tripleg.getMode().accuracy;
      var classes = ' form-control';
      var options = [];

      if(maxVal<50) {
        classes += ' form-need-check';
        options.push('<option lang="en" value="-1" disabled selected style="display:none;">Specify your travel mode</option>');
      }

      for (var i = 0; i < tripleg.mode.length; i++) {
        var mode = tripleg.mode[i];
        options.push('<option lang="en" value="' + mode.id + '">' + mode.name + '</option>');
      }

      var selector = [
        '<select class="mode-select' + classes + '" tripleg-id="' + tripleg.getId() + '" name="selectmode">',
          options.join(''),
        '</select>'
      ].join('');

      return selector;
  },

  /**
   * Generates the outerHTML for the timeline element corresponding to a tripleg
   * @param tripleg - the tripleg element
   * @returns {string} - outerHTML of the timeline element
   */
  _getContent: function(tripId, tripleg) {
    var triplegId = tripleg.getId();
    var classes = [];
    if(tripleg.isFirst) {
      classes.push('first')
    }
    if(tripleg.isLast) {
      classes.push('last')
    }

    var contentHtml = [
      '<div class="tl-circ zoom-to-tripleg" tripleg-id="'+triplegId+'" style="cursor:pointer"><span class="glyphicon glyphicon-search"></span></div>',

      '<li>',
        '<div class="timeline-panel" style="background-color:'+tripleg.getColor(0.6)+'" id="telem'+triplegId+'" tripleg-id="' + triplegId + '">',
          '<div class="tl-heading">',
            '<h4>',
              this._getModeSelector(tripleg),
            '</h4>',
            '<h5>',
               '<span class="distance">Distance: ' + tripleg.getDistance() + '</span>',
               tripleg.getTransitionTime() ? ' - <span id="transitiontime'+triplegId+'">Transfer time: ' + tripleg.getTransitionTime() + ' min </span>' : '',
            '</h5>',
          '</div>',
          '<div class="tl-body">',

            '<br>',
            '<label for="timepickerstart_'+triplegId+'">Start:</label>',
            '<div class="input-group bootstrap-timepicker timepicker">',
              '<input id="timepickerstart_'+triplegId+'" initial-time="' + tripleg.getStartTime().getTime() + '" tripleg-id=" '+tripleg.getId()+' " class="form-control time-picker start input-small ' + classes.join(' ') + '" type="text"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>',
            '</div>',

            '<label for="timepickerstart_'+triplegId+'">Stop:</label>',
            '<div class="input-group bootstrap-timepicker timepicker">',
              '<input id="timepickerend_'+triplegId+'" initial-time="' + tripleg.getEndTime().getTime() + '" tripleg-id=" '+tripleg.getId()+' " type="text" class="time-picker end form-control input-small ' + classes.join(' ') + '"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>',
            '</div>',
            tripleg.isLast ? '' : this.generatePlaceSelector(tripleg.places, tripleg.getId()),
            '<br>',
            '<a class="add-transition btn btn-default" href="#" role="button" tripleg-id="' + triplegId + '"><i class="glyphicon glyphicon-transfer"></i> Did we miss a transfer? Click to add it. </a>',
            '<button type="button" class="btn btn-default delete-tripleg" tripleg-id="' + triplegId + '"><span class="glyphicon glyphicon-trash"></span></button>',
          '</div>',
        '</div>',
      '</li>'
    ];
    console.warn('getTransitionPlace?');



    return contentHtml.join('');
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

    // Tripleg mode change
    $element.on('change', '.mode-select', function(e) {
      var triplegId = parseInt($(e.target).attr('tripleg-id'), 10);
      var tripleg = this.trip.getTriplegById(triplegId);
      tripleg.updateMode(e.target.value);
    }.bind(this));

    // Open transition modal
    $element.on('click','.add-transition', function(e) {
      var triplegId = parseInt($(e.target).attr('tripleg-id'), 10);
      var tripleg = this.trip.getTriplegById(triplegId);
      this.openTransitionChoiceModal(tripleg);
      e.preventDefault();
      return false;
    }.bind(this));

    // Insert transition between triplegs
    $element.on('click','.transition-accept', function(e) {
      var $modal = $(e.target).parent();
      var triplegId = $modal.attr('tripleg-id');
      var tripleg = this.trip.getTriplegById(triplegId);
      var startTime = this._addTime(tripleg.getStartTime(), $modal.find('#timepicker-start-transition').val());
      var endTime = this._addTime(tripleg.getEndTime(), $modal.find('#timepicker-stop-transition').val());
      var fromMode = parseInt($modal.find('#select-from').val(), 10);
      var toMode = parseInt($modal.find('#select-from').val(), 10);
      this.trip.insertTransitionBetweenTriplegs(startTime, endTime, fromMode, toMode);
    }.bind(this));

    // Tripleg panel mouseover
    $element.on('mouseover', '.timeline-panel', function(e) {
      var triplegId = $(e.currentTarget).attr('tripleg-id');
      if(triplegId) {
        var tripleg = this.trip.getTriplegById(triplegId);
        if(tripleg.polylineLayer) {
          tripleg.polylineLayer.setStyle({ opacity: 1 });
        }
      }
    }.bind(this));

    // Tripleg panel mouse exit
    $element.on('mouseout', '.timeline-panel', function(e) {
      var triplegId = $(e.currentTarget).attr('tripleg-id');
      if(triplegId) {
        var tripleg = this.trip.getTriplegById(triplegId);
        if(tripleg.polylineLayer) {
          tripleg.polylineLayer.setStyle({ opacity: 0.6 });
        }
      }
    }.bind(this));

    // Tripleg panel mouse click
    $element.on('click', '.zoom-to-tripleg', function(e) {
      var triplegId = $(e.currentTarget).attr('tripleg-id');
      if(triplegId) {
        var tripleg = this.trip.getTriplegById(triplegId);
        if(tripleg.polylineLayer) {
          map.fitBounds(tripleg.polylineLayer.getBounds());
          log.info('Zoomed to layer ' + triplegId);
        }
      }
    }.bind(this));

    // Trip purpose selector
    $element.on('change', '.purpose-selector', function(e) {
      if(e.target.value) {
        this.trip.updatePurposeOfTrip(e.target.value);
      }
    }.bind(this));

    // Trip place selector
    $element.on('change', '.place-selector.transition', function(e) {
      if(e.target.value) {
        var triplegId = $(e.currentTarget).attr('tripleg-id');
        if(triplegId) {
          var tripleg = this.trip.getTriplegById(triplegId);
          tripleg.updateTransitionPoiIdOfTripleg(e.target.value);
        }
      }
    }.bind(this));

    $element.on('change', '.place-selector.destination', function(e) {
      if(e.target.value) {
        this.trip.updateDestinationPoiIdOfTrip(e.target.value);
      }
    }.bind(this));

    $element.on('click','.go-to-previous-trip', function(e) {
      if(this.trip.isLastUnannotated) {
        
      } else {
        throw 'Move to next trip?';
      }
      e.preventDefault();
      return false;
    }.bind(this));

    $element.on('click','.go-to-next-trip', function(e) {
      if(this.trip.isLastUnannotated) {
        this.trip.confirm();
      } else {
        throw 'Move to next trip?';
      }
      e.preventDefault();
      return false;
    }.bind(this));

    $element.on('click', '.delete-tripleg', function(e) {
      var triplegId = $(e.currentTarget).attr('tripleg-id');
      if(triplegId) {
        this.trip.deleteTripleg(triplegId);
      }
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

          var previousTripEndDateLocal = moment(this.trip.getPreviousTripEndTime()).format('dddd, YY-MM-DD');

          /* Add previous trip ended panel*/
          var previousTripPanel = [
            '<li>',
              '<div class="tldate" style="width:330px"> <p lang="en">('+previousTripEndDateLocal  +') '+ this.trip.getPreviousTripEndTime(true) +' - Previous trip ended</p>',
              '</div>',
            '</li>'
          ];
          ul.append(previousTripPanel.join(''));

          /* Add previous trip summary */
          var previousTripSummaryPanel = [
            '<li class="timeline-inverted">',
              '<div class="timeline-panel" id ="firstTimelinePanel">',
                '<div class="tl-heading">',
                  '<h4 lang="en">Time spent at '+previousPlace+'</h4>',
                  '<p id="tldatefirstparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(previousTripEndDate.getHours()<10?'0':'')+previousTripEndDate.getHours()+':'+(previousTripEndDate.getMinutes()<10?'0':'')+previousTripEndDate.getMinutes()+' - '+(currentTripStartDate.getHours()<10?'0':'')+currentTripStartDate.getHours()+':'+(currentTripStartDate.getMinutes()<10?'0':'')+currentTripStartDate.getMinutes()+'</small></p>',
                '</div>',
                '<div class="tl-body">',
                  '<p lang="en">Place: '+previousPlace+'</p>',
                  '<p lang="en">Purpose: '+previousPurpose+'</p>',
                  '<p lang="en" id="firsttimeend">Time: '+timeDiff+' hours</p>',
                '</div>',
              '</div>',
            '</li>'
            ];
          ul.append(previousTripSummaryPanel.join(''));
      } else {
          var firstTimePanel = [
            '<li>',
              '<div class="tldate start" id="firstTimelinePanel">',
                '<p lang="en">This is where you started using MEILI</p>',
              '</div>',
            '</li>'
          ].join('');
          ul.append(firstTimePanel.join(''));
      }
      /* Add started trip info */
      var currentTripStartDateLocal = moment(previousTripEndDate).format('dddd')+", "+moment(currentTripStartDate).format("YY-MM-DD");
      var currentTripStartHour = moment(currentTripStartDate).format("hh:ss");

      var tripStartPanel = [
        '<li>',
          '<div class="tldate start" id="tldatefirst" style="width:330px"><span class="glyphicon large glyphicon-flag"></span><span><p lang="en" id="tldatefirstassociatedparagraph">('+currentTripStartDateLocal  +') '+currentTripStartHour+' - Started trip</p>',
            '<p lang="en"><i>Is this a fake trip? Click <span class="glyphicon glyphicon-trash" onclick="deleteTripModal()"></span> to delete.</i></p></span>',
          '</div>',
        '</li>'
      ];

      ul.append(tripStartPanel.join(''));

      var seePrevious = document.getElementById('seePrevious');

      /**
       * LISTENERS
       */
      //if (seePrevious!=null)
      //    seePrevious.onclick = previousFunction;
  },

  /**
   * Generates the last timeline element and adds it at the tail of the timeline
   */
  generateLastElement: function(){
      var ul = $('#'+this.elementId+' > ul');

      var currentTripEnd = this.trip.getEndTime();
      var currentTripEndDateLocal = moment(currentTripEnd).format('dddd')+", "+moment(currentTripEnd).format("YY-MM-DD");

      var lastTimelineElement = [
        '<li>',
          '<div class="tldate" id="tldatelast" style="width: 390px;">',
            '<span class="glyphicon glyphicon-flag large"></span> <span><p id="tldatelastassociatedparagraph" lang="en"> ('+currentTripEndDateLocal  +') '+ this.trip.getEndTime(true) +' - Ended trip</p>',
            '<p lang="en"><i> Is this a fake stop? Click <span class="glyphicon glyphicon-share-alt" onclick="mergeTripModal()"> </span> to merge with next trip.</i></p></span>',
          '</div>',
        '</li>'
      ];

      ul.append(lastTimelineElement.join(''));


      // Add ended trip info
      // TODO! move into separate method
      var displayTripEndTime = this.trip.getEndTime(true);
      if (this.trip.getNextTripStartTime() !== null) {
          // Add previous trip ended panel
          displayTripEndTime = this.trip.getEndTime(true) + ' - ' + this.trip.getNextTripStartTime(true);
      }

      var lastTripControl = [
        '<li class="timeline-inverted">',
          '<div class="timeline-panel" id="lastTimelinePanel">',
            '<div class="tl-heading">',
              '<h4 lang="en">End of trip</h4>',
              '<p id="tldatelastparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> ' + displayTripEndTime + '</small></p>',
            '</div>',
            '<div class="tl-body">',
              this.generatePlaceSelector(this.trip.getPlaces()),
              this.generatePurposeSelector(this.trip.getPurposes()),
              '<p lang="en" id="lasttimeend">Time: '+this.trip.getTimeDiffToNextTrip()+' hours</p>',
            '</div>',
          '</div>',
        '</li>'
      ];

      ul.append(lastTripControl.join(''));



      // Navigation to next trip
      // TODO! move into separate method
      var navigateToNextTrip = [
        '<li>',
          '<div class="tldate">',
            '<p lang="en"> These are all the trip data available now</p>',
          '</div>',
        '</li>'];

      if (this.trip.getNextTripStartTime() !== null) {
        /* Add process next trip */
        navigateToNextTrip = [
          '<li id="processNext">',
            '<div class="tldatecontrol">',
              '<a class="go-to-next-trip" href="#" lang="en">Process the next trip <i class="glyphicon medium glyphicon-arrow-right"></i> </a>',
            '</div>',
          '</li>'];
      }
      ul.append(navigateToNextTrip.join(''));

      /**
       * NO LISTENERS YET
       */

  /*    var processNext = document.getElementById('processNext');

      if (processNext!=null)
          processNext.onclick = nextFunction;

    */
  },

  /**
   * Generates a selector for the places (for destination) associated to a trip
   * @param places - array of places (lat, lon) that have accuracy of inference embedded
   * @returns {string|string} - outerHTML of the place selector
   */
  generatePlaceSelector: function(places, triplegId) {
    var placeSelector = [];
    if (places && places.length > 0) {

      var selectorOptions = [];
      var className = '';
      var attributes = '';
      var specifyOptionLabel = '';

      for (var i=0; i < places.length; i++) {
        var place = places[i];
        // Handle both trip and tipleg places
        var id = place.gid || place.osm_id;
        var type = place.type ? ' ('+place.type+')' : '';
        if (id !== undefined) {
          selectorOptions.push('<option value="' + id + '">' + place.name + type + '</option>');
        }
      }

      //  Destination place
      if(!triplegId) {
        // Add initial option?
        className = 'destination';
        specifyOptionLabel = 'Specify your destination';
      } else {
        className = 'transition';
        attributes = 'tripleg-id="' + triplegId + '"';
        specifyOptionLabel = '(Optional) Specify transfer place';
      }

      var maxAccuracy = places[0].accuracy;
      if (maxAccuracy < 50) {
        // Can not preselect for the user
        selectorOptions.unshift('<option value="-1" disabled selected lang="en">' + specifyOptionLabel + '</option>');
      }

      placeSelector = ['<p lang="en">',
                        '<label for="place-selector">Place: </label>',
                        '<div>',
                        '<select class="form-control form-control-inline place-selector ' + className + '" ' + attributes + '>',
                          selectorOptions.join(''),
                        '</select></p>',
                        '</div>'];
    }
    return placeSelector.join('');
  },

  /**
   * Generates a selector for the purposes associated with a trip
   * @param purposes - an array of purposes and their inference certainty
   * @returns {string|string} outerHTML of the purpose selector
   */
  generatePurposeSelector: function(purposes) {
    var purposeSelector = '';
    if(purposes && purposes.length > 0) {
      var maxAccuracy = purposes[0].accuracy;
      var purposeSelector = '<p lang="en">' +
                              '<label for="purpose-selector">Purpose: </label>'+
                              '<div>' +
                              '<select class="form-control form-control-inline form-need-check purpose-selector">';

      // Accuracy is not high enough to preselect for the user
      if (maxAccuracy < 50){
        purposeSelector += '<option value="-1" lang="en" disabled selected>Specify your trip\'s purpose</option>';
      }

      for (var i=0; i < purposes.length; i++){
        var purpose = purposes[i];
        purposeSelector += '<option value="' + purpose.id + '" lang="en">' + purpose.name + '</option>';

      }
      purposeSelector += '</select></div>';
    }
    return purposeSelector;
  },


  getTransitionPanel: function(tripleg) {
    var transitionPanel = [];

    // Not the last trip leg -> generate panel
    // TODO! handle language for mode and the case that there is no mode set
    if (!tripleg.isLast){
      var nextTripleg = tripleg.getNext();
      transitionPanel = [
        '<li>',
          '<div class="tldate transition-panel" id="tldate' + nextTripleg.getId() + '">',
            '<p lang="en">'+ tripleg.getEndTime(true) +' - '+ nextTripleg.getStartTime(true) +' - Tranferred from '+ tripleg.getMode().name +' to '+ nextTripleg.getMode().name +'</p>',
          '</div>',
        '</li>'];
    }

    return transitionPanel.join('');
  },

  /**
   * Appends the timeline element of a tripleg to the timeline list and adds its listeners
   * @param tripleg - the tripleg element
   */
  generateElement: function(tripId, tripleg) {

    if (tripleg.getType() == 1){
      var ul = $('#'+this.elementId+' > ul');
      var li = document.createElement("li");
      li.id = "listItem"+tripleg.getId();
      var thisHtml = this._getContent(tripId, tripleg);

      li.innerHTML = thisHtml;
      // Add tripleg panel
      ul.append(li);
      // Add transition panel
      ul.append(this.getTransitionPanel(tripleg));

      // Activate timepickers
      $('#timepickerstart_'+tripleg.triplegid).timepicker({
          minuteStep: 1,
          showMeridian: false,
          disableMousewheel:false,
          defaultTime: tripleg.getStartTime(true)
      }).on('hide.timepicker', this._onTimeSet.bind(this));


      $('#timepickerend_'+tripleg.triplegid).timepicker({
          minuteStep: 1,
          showMeridian: false,
          disableMousewheel:false,
          defaultTime: tripleg.getEndTime(true)
      }).on('hide.timepicker', this._onTimeSet.bind(this));

    }
  },

  /**
   * Generates the modal dialogs for a tripleg
   */
  initiateModals: function() {

    this.transitionModalId = 'transition-modal';
    this.getTransitionModal = function() {
      return $(this.transitionModalId);
    };
    var transitionModal = [
      '<div id="' + this.transitionModalId + '" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">',
        '<div class="modal-dialog modal-sm">',
          '<div class="modal-content">',
            '<h4>New transfer point</h4>',

            '<p style="display:inline; border-bottom: 0px;">Transfer type: </p>',
              '<select class="form-control form-control-inline" id="transition-type" style="display: inline-block; border: 0px; width:190px; color:black; font-size:15;" onchange="transitionTypeEnabler(this.id)">',
                '<option value="1">Parking place</option>',
                '<option value="2">Station</option>',
              '</select>',

            '<div id="station-info" style="display:none">',
              '<input type="text" class="form-controlV2" style="display:inline-block; width:49%; margin-right:5px;" placeholder="Name" aria-describedby="basic-addon1" id="transition-name">',
              '<input type="text" class="form-controlV2" style="display:inline-block; width:49%;" placeholder="Lines: e.g.:1,2,5" aria-describedby="basic-addon1" id="transition-lines">',
              '<form role="form" id="checkbox-form">',
                '<div class="checkbox" style="display: inline-block; width:30%;"><label><input type="checkbox" value="1">Bus</label></div>',
                '<div class="checkbox" style="display: inline-block; width:30%;"><label><input type="checkbox" value="2">Tram</label></div>',
                '<div class="checkbox" style="display: inline-block; width:30%;"><label><input type="checkbox" value="3">Subway</label></div>',
              '</form>',
            '</div>',

            '<button id="transition-button" type="button" class="btn btn-default" style="width:48%; display:inline-block; margin-left:5px" data-dismiss="modal" onclick="transitionMarker(this.id)">Draw</button>',
            '<button type="button" class="btn btn-default" style="width:48%; display:inline-block;" data-dismiss="modal" ">Cancel</button>',
          '</div>',
        '</div>',
      '</div>'
    ];
    $('#'+this.elementId).append(transitionModal.join(''));

    this.transitionChoiceModalId = 'transition-choice-modal';
    var transitionChoiceModal = [
      '<div id="' + this.transitionChoiceModalId + '" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">',
        '<div class="modal-dialog modal-sm" style="width:350px">',
          '<div class="modal-content">',
            '<h4 style="border-bottom: 2px solid #c25b4e;padding-bottom: 3px;">Insert a new transfer</h4>',

            '<p style="display:inline-block; border-bottom: 0px; text-align: left; width:60%;">From mode of transportation: </p>',
              '<select id="select-from" style="display: inline-block" class="form-controlV2">',
              '</select>',

            '<br>',

            '<p style="display:inline-block; border-bottom: 0px; text-align: left; width:60%;">To mode of transportation: </p>',
              '<select id="select-to" style="display: inline-block" class="form-controlV2">',
              '</select>',

            '<br>',

            '<label for="timepicker-start-transition">Start of transfer:</label>',
            '<div class="input-group bootstrap-timepicker timepicker">',
              '<input id="timepicker-start-transition" type="text" class="form-control input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>',
            '</div>',

            '<label for="timepicker-stop-transition">Stop of tranfer:</label>',
            '<div class="input-group bootstrap-timepicker timepicker">',
              '<input id="timepicker-stop-transition" type="text" class="form-control input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>',
            '</div>',

            '<button type="button" class="transition-accept btn btn-default center-block" style="width:48%; display:inline-block; margin-left:5px">Accept</button>',
            '<button type="button" class="transition-cancel btn btn-default center-block" data-dismiss="modal" style="width:48%; display:inline-block;">Cancel</button>',
          '</div>',
        '</div>',
      '</div>'
    ];

    $('#'+this.elementId).append(transitionChoiceModal.join(''));

    this.openTransitionChoiceModal = function(tripleg) {
      var $modal = $('#'+this.transitionChoiceModalId);

      $modal.find('.modal-content').attr('tripleg-id', tripleg.getId());
      // Add modes to selectors
      var modeOptions = [];
      for (var i = 0; i < tripleg.mode.length; i++) {
        var mode = tripleg.mode[i];
        modeOptions.push('<option value="' + mode.id + '">' + mode.name + '</option>');
      }
      $modal.find('#select-from').append(modeOptions);
      $modal.find('#select-to').append(modeOptions);

      $('#timepicker-start-transition').timepicker({
        minuteStep: 1,
        showMeridian: false,
        defaultTime: tripleg.getStartTime(true),
        appendWidgetTo: '#'+this.transitionChoiceModalId
      }).on('hide.timepicker', function(e) {
      }.bind(this));
      $('#timepicker-stop-transition').timepicker({
        minuteStep: 1,
        showMeridian: false,
        defaultTime: tripleg.getEndTime(true),
        appendWidgetTo: '#'+this.transitionChoiceModalId
      }).on('hide.timepicker', function(e) {
      }.bind(this));

      $modal.modal('show');
    };
  },

  resize: function() {
    $('#'+this.elementId).height($('body').height()-$('#navbar-top').height()+'px');
  }

};