
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
      var maxVal = tripleg.mode[0].accuracy;
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
        '<div class="timeline-panel" id="telem'+triplegId+'" tripleg-id="' + triplegId + '">',
          '<div class="tl-heading">',
            '<h4>',
              this._getModeSelector(tripleg),
            '</h4>',
          '</div>',
          '<div class="tl-body">',

            '<br>',
            '<label for="timepickerstart_'+triplegId+'">Start:</label>',
            '<div class="input-group bootstrap-timepicker timepicker">',
              '<input id="timepickerstart_'+triplegId+'" initial-time="' + tripleg.start_time + '" tripleg-id=" '+tripleg.getId()+' " class="form-control time-picker start input-small ' + classes.join(' ') + '" type="text"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>',
            '</div>',

            '<a class="add-transition btn btn-default" href="#" role="button" tripleg-id="' + triplegId + '"><i class="glyphicon glyphicon-transfer"></i> Did we miss a transfer? Click to add it. </a>',

            '<p lang="en" class="distance">Distance:' + tripleg.getDistance() + '</p>',

            '<label for="timepickerstart_'+triplegId+'">Stop:</label>',
            '<div class="input-group bootstrap-timepicker timepicker">',
              '<input id="timepickerend_'+triplegId+'" trip-id="' + tripId + '" type="text" class="time-picker end form-control input-small ' + classes.join(' ') + '"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>',
            '</div>',
            //if (!tripleg.isLast) '<hr>',
            //getTransitionPlace(tripleg, isLast),
            tripleg.getTransitionTime() ? '<p id="transitiontime'+triplegId+'">Transfer time: ' + tripleg.getTransitionTime() + ' min <span class="glyphicon glyphicon-trash" style="float: right;" onclick="mergeWithNext(\''+triplegId+'\')"></span></p>' : '',
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
   /*  var transitionSelectOption = document.getElementById('transitionSelect'+tripleg.triplegid);

      if (transitionSelectOption!=null)
          transitionSelectOption.onchange = transitionSelectListener;
*/
      $('#'+this.elementId).on('change', '.mode-select', function(e) {
        var triplegId = parseInt($(e.target).attr('tripleg-id'), 10);
        var tripleg = this.trip.getTriplegById(triplegId);
        tripleg.updateMode(e.target.value);
      }.bind(this));

      /********************************************
       * Adding listeners to the timeline elements*
       ********************************************/
      $('#'+this.elementId).on('click','.add-transition', function(e) {
        var triplegId = parseInt($(e.target).attr('tripleg-id'), 10);
        var tripleg = this.trip.getTriplegById(triplegId);
        this.openTransitionChoiceModal(tripleg);
        e.preventDefault();
        return false;
      }.bind(this));

      $('#'+this.elementId).on('click','.transition-accept', function(e) {
        var $modal = $(e.target).parent();
        var triplegId = $modal.attr('tripleg-id');
        var tripleg = this.trip.getTriplegById(triplegId);
        var startTime = this._addTime(tripleg.getStartTime(), $modal.find('#timepicker-start-transition').val());
        var endTime = this._addTime(tripleg.getEndTime(), $modal.find('#timepicker-stop-transition').val());
        var fromMode = parseInt($modal.find('#select-from').val(), 10);
        var toMode = parseInt($modal.find('#select-from').val(), 10);
        this.trip.insertTransitionBetweenTriplegs(startTime, endTime, fromMode, toMode);
      }.bind(this));

      // Mouseover
      $('#'+this.elementId).on('mouseover', '.timeline-panel', function(e) {
        var triplegId = $(e.currentTarget).attr('tripleg-id');
        if(triplegId) {
          var tripleg = this.trip.getTriplegById(triplegId);
          if(tripleg.polylineLayer) {
            tripleg.polylineLayer.setStyle({ opacity: 1 });
          }
        }
      }.bind(this));

      // Mouse exit
      $('#'+this.elementId).on('mouseout', '.timeline-panel', function(e) {
        var triplegId = $(e.currentTarget).attr('tripleg-id');
        if(triplegId) {
          var tripleg = this.trip.getTriplegById(triplegId);
          if(tripleg.polylineLayer) {
            tripleg.polylineLayer.setStyle({ opacity: 0.6 });
          }
        }
      }.bind(this));

      // Mouse click
      $('#'+this.elementId).on('click', '.zoom-to-tripleg', function(e) {
        var triplegId = $(e.currentTarget).attr('tripleg-id');
        if(triplegId) {
          var tripleg = this.trip.getTriplegById(triplegId);
          if(tripleg.polylineLayer) {
            map.fitBounds(tripleg.polylineLayer.getBounds());
            log.info('Zoomed to layer ' + triplegId);
          }
        }
      }.bind(this));


  },

    /**
   * Generates the first timeline element and adds it at the head of the timeline
   */
  generateFirstElement: function(){
      var ul = $('#'+this.elementId+' > ul');
      var li = document.createElement("li");
      li.id= 'firstTimelineElement';


      var previousPurpose = this.trip.previous_trip_purpose;
      var previousPlace = this.trip.previous_trip_poi_name;
      var previousTripEndDate = new Date(parseInt(this.trip.previous_trip_end_date));
      var currentTripStartDate = new Date(parseInt(this.trip.current_trip_start_date));

      console.log(previousPurpose);
      console.log(previousTripEndDate+" " +this.trip.previous_trip_end_date);
      console.log(previousPlace);


      var timeDiff = Math.abs(currentTripStartDate.getTime() - previousTripEndDate.getTime());
      var htmlToAddTime=''
      if ((timeDiff/1000*60)<60){
          htmlToAddTime =Math.ceil(timeDiff/1000*60)+' minutes';
      }
      else
      {
          htmlToAddTime= Math.ceil(timeDiff / (1000 * 60 * 60))+' hours';
      }

      var thisHtml = '<li>';

      if (previousPurpose!=null) {
          /* Add see previous button */

          thisHtml += '<div class="tldatecontrol" id="seePrevious"> <p lang="en"> <i class="glyphicon glyphicon-arrow-up"></i> See previous trip <i class="glyphicon glyphicon-arrow-up"></i> </p>';// <p lang="sv"><i class="glyphicon glyphicon-arrow-up"></i> Gå tillbaka till den senaste förflyttningen <i class="glyphicon glyphicon-arrow-up"></i> </p>';
          thisHtml += '</div>';
          thisHtml += '</li>';

          var previousTripEndDateLocal = moment(previousTripEndDate).format('dddd')+", "+moment(previousTripEndDate).format("YY-MM-DD");
          var previousTripEndHour = moment(previousTripEndDate).format('hh:ss');

          /* Add previous trip ended panel*/
          thisHtml += '<li>';
          thisHtml += '<div class="tldate" style="width:330px"> <p lang="en">('+previousTripEndDateLocal  +') '+previousTripEndHour+' - Previous trip ended</p>';// <p lang="sv">('+previousTripEndDateLocalSv  +') '+previousTripEndHour+' - -Senaste förflyttningen slutade</p>';
          thisHtml += '</div>';
          thisHtml += '</li>';

          /* Add previous trip summary */
          thisHtml += '<li class="timeline-inverted">';
          thisHtml += '<div class="timeline-panel" id ="firstTimelinePanel">';
          thisHtml += '<div class="tl-heading">';
          thisHtml += '<h4 lang="en">Time spent at '+previousPlace+'</h4>';

          thisHtml += '<p id="tldatefirstparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(previousTripEndDate.getHours()<10?'0':'')+previousTripEndDate.getHours()+':'+(previousTripEndDate.getMinutes()<10?'0':'')+previousTripEndDate.getMinutes()+' - '+(currentTripStartDate.getHours()<10?'0':'')+currentTripStartDate.getHours()+':'+(currentTripStartDate.getMinutes()<10?'0':'')+currentTripStartDate.getMinutes()+'</small></p>';
          thisHtml += '</div>';
          thisHtml += '<div class="tl-body">';
          thisHtml += '<p lang="en">Place: '+previousPlace+'</p>';
          thisHtml += '<p lang="en">Purpose: '+previousPurpose+'</p>';
          thisHtml += '<p lang="en" id="firsttimeend">Time: '+htmlToAddTime+'</p>';
          thisHtml += '</div>';
          thisHtml += '</div>';
          thisHtml += '</li>';
      }
      else{
          thisHtml += '<li>';
          thisHtml += '<div class="tldate start" id="firstTimelinePanel"> <p lang="en">This is where you started using MEILI</p>' 

          thisHtml += '</div>';
          thisHtml += '</li>';
      }
      /* Add started trip info */
      var currentTripStartDateLocal = moment(previousTripEndDate).format('dddd')+", "+moment(currentTripStartDate).format("YY-MM-DD");
      var currentTripStartHour = moment(currentTripStartDate).format("hh:ss");

      thisHtml+='<li>';
      thisHtml+='<div class="tldate" id="tldatefirst" style="width:330px"><p lang="en" id="tldatefirstassociatedparagraph"><span class="glyphicon glyphicon-flag"></span>('+currentTripStartDateLocal  +') '+currentTripStartHour+' - Started trip</p>';// <p id="tldatefirstassociatedparagraphsv" lang="sv"><span class="glyphicon glyphicon-flag"></span>('+currentTripStartDateLocalSv  +') '+currentTripStartHour+' - Påbörjade förflyttning</p>';
      thisHtml+='<p lang="en"><i>Is this a fake trip? Click <span class="glyphicon glyphicon-trash" onclick="deleteTripModal()"></span> to delete.</i></p>';
      thisHtml+='</div>';
      thisHtml+='</li>';

      li.innerHTML = thisHtml;

      ul.append(li)

      console.log(currentTripStartDate);

      var seePrevious = document.getElementById('seePrevious');

      /**
       * LISTENERS
       */
      if (seePrevious!=null)
          seePrevious.onclick = previousFunction;
  },

  /**
   * Generates the last timeline element and adds it at the tail of the timeline
   */
  generateLastElement: function(){
      var ul = $('#'+this.elementId+' > ul');
      var li = document.createElement("li");
      li.id= 'lastTimelineElement';

      var currentTripEndDate = new Date(parseInt(this.trip.current_trip_end_date));

      var hours = currentTripEndDate.getHours();
      var minutes = currentTripEndDate.getMinutes();
      var seconds = currentTripEndDate.getSeconds();

      hours = hours < 10 ? '0'+ hours: hours;
      minutes = minutes < 10 ? '0'+minutes : minutes;
      seconds = seconds < 10 ? '0'+seconds : seconds;

      var currentTripEndDateLocal = moment(currentTripEndDate).format('dddd')+", "+moment(currentTripEndDate).format("YY-MM-DD");

      var currentTripEndDateHour = moment(currentTripEndDate).format("hh:ss");

      var thisHtml = '<li><div class="tldate" id="tldatelast" style="width: 350px;">';
      thisHtml += '<p id="tldatelastassociatedparagraph" lang="en"> <span class="glyphicon glyphicon-flag"> </span>('+currentTripEndDateLocal  +') '+currentTripEndDateHour+' - Ended trip</p>';
      thisHtml += '<p lang="en"><i> Is this a fake stop? Click <span class="glyphicon glyphicon-share-alt" onclick="mergeTripModal()"> </span> to merge with next trip.</i></p>';
      thisHtml += '</div></li>';
      var places = this.trip.destination_places;
      var purposes = this.trip.purposes;

      if (this.trip.next_trip_start_date!=null) {
      /* Add ended trip info */

          nextTripStartDate = new Date(parseInt(this.trip.next_trip_start_date));
          var timeDiff = Math.abs(nextTripStartDate.getTime() - currentTripEndDate.getTime());
          var hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));


          /* Add previous trip ended panel*/
          thisHtml += '<li class="timeline-inverted">';
          thisHtml += '<div class="timeline-panel"  id ="lastTimelinePanel">';
          thisHtml += '<div class="tl-heading">';
          thisHtml += '<h4 lang="en">End of trip</h4>';
          thisHtml += '<p id="tldatelastparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(currentTripEndDate.getHours()<10?'0':'')+currentTripEndDate.getHours()+':'+(currentTripEndDate.getMinutes()<10?'0':'')+currentTripEndDate.getMinutes()+' - '+(nextTripStartDate.getHours()<10?'0':'')+nextTripStartDate.getHours()+':'+(nextTripStartDate.getMinutes()<10?'0':'')+nextTripStartDate.getMinutes()+'</small></p>';
          thisHtml += '</div>';
          thisHtml += '<div class="tl-body">';
//              thisHtml += '<p lang="en">Place: '+getPlaceSelector(places)+'</p>';
//               thisHtml += '<p lang="en">Purpose: '+getPurposeSelector(purposes)+'</p>';
             thisHtml += '<p lang="en" id="lasttimeend">Time: '+hoursDiff+' hours</p>';
          thisHtml += '</div>';
          thisHtml += '</div>';
          thisHtml += '</li>';

          /* Add process next trip */
          thisHtml += '<li id="processNext">';
          thisHtml += '<div class="tldatecontrol"> <p lang="en"><i class="glyphicon glyphicon-arrow-down"></i> Process the next trip <i class="glyphicon glyphicon-arrow-down"></i> </p>';// <p lang="sv"><i class="glyphicon glyphicon-arrow-down"></i> Gå till nästa förflyttning <i class="glyphicon glyphicon-arrow-down"></i> </p>';
          thisHtml += '</div>';
          thisHtml += '</li>';
      }
      else{
          thisHtml += '<li class="timeline-inverted">';
          thisHtml += '<div class="timeline-panel" id ="lastTimelinePanel">';
          thisHtml += '<div class="tl-heading">';
          thisHtml += '<h4 lang="en">End of the trip</h4>';
          thisHtml += '<p id="tldatelastparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(currentTripEndDate.getHours()<10?'0':'')+currentTripEndDate.getHours()+':'+(currentTripEndDate.getMinutes()<10?'0':'')+currentTripEndDate.getMinutes()+'</small></p>';
          thisHtml += '</div>';
          thisHtml += '<div class="tl-body">';
 //            thisHtml += '<p lang="en">Place: '+getPlaceSelector(places)+'</p>';
 //              thisHtml += '<p lang="en">Purpose: '+getPurposeSelector(purposes)+'</p>';
            thisHtml += '</div>';
          thisHtml += '</div>';
          thisHtml += '</li>';

          thisHtml += '<li><div class="tldate">';
          thisHtml += '<p lang="en"> These are all the trip data available now</p>';
          thisHtml += '</div></li>';
      }

      li.innerHTML = thisHtml;

      ul.append(li)

      /**
       * NO LISTENERS YET
       */

  /*    var processNext = document.getElementById('processNext');

      if (processNext!=null)
          processNext.onclick = nextFunction;

      var selectOption = document.getElementById('placeSelect');
      selectOption.onchange = placeSelectListener;

      var selectPurposeOption = document.getElementById('purposeSelect');
      selectPurposeOption.onchange = purposeSelectListener;
    */
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

      console.warn('generateModal?');
      //thisHtml+=generateModal(tripleg.triplegid, isFirst, isLast);

      console.warn('getTransitionPanel?');
      //if(getTransitionPanel(tripleg, isLast)!=undefined)
      //    getTransitionPanel(tripleg, isLast);

      li.innerHTML = thisHtml;

      ul.append(li);

      $('#timepickerstart_'+tripleg.triplegid).timepicker({
          minuteStep: 1,
          showMeridian: false,
          disableMousewheel:false,
          timeFormat: 'H:i',
          defaultTime: tripleg.getStartTime()
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