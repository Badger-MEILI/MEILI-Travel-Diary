
var Timeline = function(options) {
  var elementId = options.elementId;


  function onTimeSet(e) {

    var $target = $(e.target);
    var triplegId = parseInt($target.attr('id').split('_')[1],10);

    var tripId = currentTrip.trip_id;
    var tripleg = currentTrip.getTriplegById(triplegId);

    var initialTime = tripleg.points[0].time;
    var endTime = tripleg.points[tripleg.points.length-1].time;
    var initialTimeDate = new Date(tripleg.points[0].time);

    var newTime = new Date(initialTime);
    newTime.setMinutes(e.time.minutes);
    newTime.setHours(e.time.hours);
    newTime = newTime.getTime();

    //log.info(userId,'changed timepicker start value of tripleg '+tripleg.triplegid+' to '+ newTime);

    /**
    * CONSEQUENCE 0 - Start time sooner than end time
    */

    if ($target.hasClass('start')) {
      if(initialTime < newTime && newTime < endTime) {
        /**
        * CONSEQUENCE 1 - Within the trip's time frame
        * a) if it is the first trip leg, the currentTripStartDate can be changed , but not before the end of last trip
        * b) if it is the last trip leg, the currentTripEndDate can be changed, but not after the beginning of next trip
        */

        // !TODO fix separation of first and last in a better way
        if(tripleg.isFirst) {
           api.trips.updateStartTime(tripId, newTime)
            .done(function(triplegs) {
              debugger;
            });
        } else {
          api.triplegs.updateStartTime(tripleg.triplegid, newTime)
            .done(function(triplegs) {
              debugger;
            });
        }
      } else {
        alert('Trip\'s start time cannot be later than the trip\'s end time');
        $(e.target).timepicker('setTime', initialTimeDate.getHours()+":"+initialTimeDate.getMinutes());
      }
    } else if($target.hasClass('end')) {
      if(initialTime < newTime && newTime < endTime) {
        if(tripleg.isFirst) {
           api.trips.updateEndTime(tripId, newTime)
            .done(function(triplegs) {
              debugger;
            });
        } else {
          api.triplegs.updateEndTime(tripleg.triplegid, newTime)
            .done(function(triplegs) {
              debugger;
            });
        }
      } else {
        alert('Trip\'s end time cannot be later than the trip\'s end time');
        $(e.target).timepicker('setTime', initialTimeDate.getHours()+":"+initialTimeDate.getMinutes());
      }
    }
    e.preventDefault();
  }

  /**
   * Returns the outerHTML of a MODE selector
   * @param mode - an array containing mode ids and their inference confidence
   * @param triplegid - the id of the tripleg with which the modes are associated with
   * @returns {string} - outerHTML of the mode selector
   */
  function getSelector(mode, triplegid){
      mode.sort(compare);
      var maxVal = mode[0].accuracy;
      var classes = 'form-control';
      var options = [];

      if (maxVal<50) {
          classes += ' form-need-check';
          options.push('<option lang="en" value="-1" disabled selected style="display:none;">Specify your travel mode</option>');
      }

      for (var i in mode) {
          options.push('<option lang="en" value="' + mode[i].id + '">' + mode[i].name + '</option>');
      }

      var selector = [
        '<select id="selectbasic' + triplegid + '" name="selectbasic" class="' + classes + '">',
          options.join(''),
        '</select>'
      ].join('');

      return selector;
  }

  /**
   * Generates the outerHTML for the timeline element corresponding to a tripleg
   * @param tripleg - the tripleg element
   * @returns {string} - outerHTML of the timeline element
   */
  function getContent(tripleg, isFirst, isLast) {
      var thisHtml= '<div class="tl-circ" id="telem_circle'+tripleg.triplegid+'" style="cursor:pointer"><span class="glyphicon glyphicon-search"></span></div>';

      thisHtml+='<li>';
      thisHtml+= '<div class="timeline-panel" id="telem'+tripleg.triplegid+'">';
      thisHtml+= '<div class="tl-heading">';
      thisHtml+= '<h4>';
      thisHtml+= getSelector(tripleg.mode, tripleg.triplegid);
      thisHtml+= '</h4>';
      thisHtml+= '</div>';
      thisHtml+= '<div class="tl-body">';

      thisHtml+= '<br>';
      thisHtml+= '<div class="input-group bootstrap-timepicker">';
      thisHtml+= 'Start: <input id="timepickerstart_'+tripleg.triplegid+'" class="time-picker start input-small" type="text"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';


      thisHtml+= '</div>';

      thisHtml+= '<p lang="en" style="font-style:italic" id="addtransition'+tripleg.triplegid+'" onclick="generateTransitionPopup(\''+tripleg.triplegid+'\')">Did we miss a transfer? Click to add it.</p>';// <p lang="sv" style="font-style:italic" id="addtransition'+tripleg.triplegid+'" onclick="generateTransitionPopup(\''+tripleg.triplegid+'\')">Har vi missat ett byte? Klicka för att lägga till.</p>';
      thisHtml+= '<p lang="en" id="distPar'+tripleg.triplegid+'">Distance:'+getDistanceOfTripLeg(tripleg)+'</p>';// <p lang="sv" id="distPar'+tripleg.triplegid+'">Avstånd:'+getDistanceOfTripLeg(tripleg.triplegid)+'</p>';
      thisHtml+= '<div class="input-group bootstrap-timepicker">'
      thisHtml+= 'Stop: <input id="timepickerend_'+tripleg.triplegid+'" type="text" class="time-picker end input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
      if (!isLast) thisHtml+= '<hr>';
      thisHtml+= getTransitionPlace(tripleg, isLast);
      thisHtml+= getTransitionTime(tripleg, isLast);
      thisHtml+= '</div>';

      return thisHtml;
  };


    /**
   * Adds listeners to a timeline element associated with a tripleg and checks for consequences of time change
   * @param tripleg - tripleg
   */
  function addListeners(tripId, tripleg, isFirst, isLast) {
      var transitionSelectOption = document.getElementById('transitionSelect'+tripleg.triplegid);

      if (transitionSelectOption!=null)
          transitionSelectOption.onchange = transitionSelectListener;

      console.log(tripleg.triplegid);

      console.log(tripleg);
      var initialTime = new Date(tripleg.points[0].time);
      var endTime = new Date(tripleg.points[tripleg.points.length-1].time);
      console.log(initialTime);
      console.log(endTime);

      var selectOption = document.getElementById('selectbasic'+tripleg.triplegid);
      selectOption.onchange = selectOptionListener;

      /********************************************
       * Adding listeners to the timeline elements*
       ********************************************/

      /**
       * Mouse over
       */
      $("#telem"+tripleg.triplegid).mouseover(function()
      {
          var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];

          layer.setStyle({
              opacity:1
          });

      });

      /**
       * Mouse exit
       */

      $("#telem"+tripleg.triplegid).mouseout(function()
      {
          var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];
          layer.setStyle({
              opacity:0.6
          });

      });

      /**
       * Mouse click
       */

      $("#telem_circle"+tripleg.triplegid).click(function()
      {
          var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];
          map.fitBounds(layer.getBounds());

          log.info(userId,'zoomed to layer '+tripleg.triplegid);
      });

      /**
       * Initialize time pickers
       */

      var initialTime = new Date(tripleg.points[0].time);
      var endTime = new Date(tripleg.points[tripleg.points.length-1].time);

      $('#timepickerstart_'+tripleg.triplegid).timepicker({
          minuteStep: 1,
          showMeridian: false,
          disableMousewheel:false,
          defaultTime:(initialTime.getHours()<10?'0':'')+initialTime.getHours()+":"+(initialTime.getMinutes()<10?'0':'')+initialTime.getMinutes()
      }).on('hide.timepicker', onTimeSet);


      $('#timepickerend_'+tripleg.triplegid).timepicker({
          minuteStep: 1,
          showMeridian: false,
          disableMousewheel:false,
          defaultTime: (endTime.getHours()<10?'0':'') +endTime.getHours()+":"+(endTime.getMinutes()<10?'0':'')+endTime.getMinutes()
      }).on('hide.timepicker', onTimeSet);


  };

  return {
      /**
     * Generates the first timeline element and adds it at the head of the timeline
     */
    generateFirstElement: function(currentTrip){
        var ul = document.getElementById("timeline");
        var li = document.createElement("li");
        li.id= 'firstTimelineElement';


        var previousPurpose = currentTrip.previous_trip_purpose;
        var previousPlace = currentTrip.previous_trip_poi_name;
        var previousTripEndDate = new Date(parseInt(currentTrip.previous_trip_end_date));
        var currentTripStartDate = new Date(parseInt(currentTrip.current_trip_start_date));

        console.log(previousPurpose);
        console.log(previousTripEndDate+" " +currentTrip.previous_trip_end_date);
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

            var previousTripEndDateLocal = days[new Date(previousTripEndDate).getDay()]+", "+new Date(previousTripEndDate).format("Y-m-d");
            var previousTripEndDateLocalSv = days_sv[new Date(previousTripEndDate).getDay()]+", "+new Date(previousTripEndDate).format("Y-m-d");

            var previousTripEndHour = new Date(previousTripEndDate).format("H:i");

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
            thisHtml += '<div class="tldate" id ="firstTimelinePanel"> <p lang="en">This is where you started using MEILI</p>' 

            thisHtml += '</div>';
            thisHtml += '</li>';
        }
        /* Add started trip info */
        var currentTripStartDateLocal = days[new Date(currentTripStartDate).getDay()]+", "+new Date(currentTripStartDate).format("Y-m-d");
        var currentTripStartDateLocalSv = days_sv[new Date(currentTripStartDate).getDay()]+", "+new Date(currentTripStartDate).format("Y-m-d");
        var currentTripStartHour = new Date(currentTripStartDate).format("H:i");

        thisHtml+='<li>';
        thisHtml+='<div class="tldate" id="tldatefirst" style="width:330px"><p lang="en" id="tldatefirstassociatedparagraph"><span class="glyphicon glyphicon-flag"></span>('+currentTripStartDateLocal  +') '+currentTripStartHour+' - Started trip</p>';// <p id="tldatefirstassociatedparagraphsv" lang="sv"><span class="glyphicon glyphicon-flag"></span>('+currentTripStartDateLocalSv  +') '+currentTripStartHour+' - Påbörjade förflyttning</p>';
        thisHtml+='<p lang="en"><i>Is this a fake trip? Click <span class="glyphicon glyphicon-trash" onclick="deleteTripModal()"></span> to delete.</i></p>';
        thisHtml+='</div>';
        thisHtml+='</li>';

        li.innerHTML = thisHtml;

        ul.appendChild(li)

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
    generateLastElement: function(currentTrip){
        var ul = document.getElementById("timeline");
        var li = document.createElement("li");
        li.id= 'lastTimelineElement';

        var currentTripEndDate = new Date(parseInt(currentTrip.current_trip_end_date));

        var hours = currentTripEndDate.getHours();
        var minutes = currentTripEndDate.getMinutes();
        var seconds = currentTripEndDate.getSeconds();

        hours = hours < 10 ? '0'+ hours: hours;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        seconds = seconds < 10 ? '0'+seconds : seconds;

        var currentTripEndDateLocal = days[new Date(currentTripEndDate).getDay()]+", "+new Date(currentTripEndDate).format("Y-m-d");
        var currentTripEndDateLocalSv = days_sv[new Date(currentTripEndDate).getDay()]+", "+new Date(currentTripEndDate).format("Y-m-d");

        var currentTripEndDateHour = new Date(currentTripEndDate).format("H:i");

        var thisHtml = '<li><div class="tldate" id="tldatelast" style="width: 350px;">';
        thisHtml += '<p id="tldatelastassociatedparagraph" lang="en"> <span class="glyphicon glyphicon-flag"> </span>('+currentTripEndDateLocal  +') '+currentTripEndDateHour+' - Ended trip</p>';
        thisHtml += '<p lang="en"><i> Is this a fake stop? Click <span class="glyphicon glyphicon-share-alt" onclick="mergeTripModal()"> </span> to merge with next trip.</i></p>';
        thisHtml += '</div></li>';
        var places = currentTrip.destination_places;
        var purposes = currentTrip.purposes;

        if (currentTrip.next_trip_start_date!=null) {
        /* Add ended trip info */

            nextTripStartDate = new Date(parseInt(currentTrip.next_trip_start_date));
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
                thisHtml += '<p lang="en">Place: '+getPlaceSelector(places)+'</p>';
                  thisHtml += '<p lang="en">Purpose: '+getPurposeSelector(purposes)+'</p>';
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
               thisHtml += '<p lang="en">Place: '+getPlaceSelector(places)+'</p>';
                  thisHtml += '<p lang="en">Purpose: '+getPurposeSelector(purposes)+'</p>';
              thisHtml += '</div>';
            thisHtml += '</div>';
            thisHtml += '</li>';

            thisHtml += '<li><div class="tldate">';
            thisHtml += '<p lang="en"> These are all the trip data available now</p>';
            thisHtml += '</div></li>';
        }

        li.innerHTML = thisHtml;

        ul.appendChild(li)

        /**
         * NO LISTENERS YET
         */

        var processNext = document.getElementById('processNext');

        if (processNext!=null)
            processNext.onclick = nextFunction;

        var selectOption = document.getElementById('placeSelect');
        selectOption.onchange = placeSelectListener;

        var selectPurposeOption = document.getElementById('purposeSelect');
        selectPurposeOption.onchange = purposeSelectListener;
    },

    /**
     * Appends the timeline element of a tripleg to the timeline list and adds its listeners
     * @param tripleg - the tripleg element
     */
    generateElement: function(tripId, tripleg, isFirst, isLast) {

      if (tripleg.type_of_tripleg == 1){
        var ul = document.getElementById(elementId);
        var li = document.createElement("li");
        li.id = "listItem"+tripleg.triplegid;
        var thisHtml = getContent(tripleg, isLast);

        thisHtml+=generateModal(tripleg.triplegid, isFirst, isLast);

        if(getTransitionPanel(tripleg, isLast)!=undefined)
            thisHtml+= getTransitionPanel(tripleg, isLast);

        li.innerHTML = thisHtml;

        ul.appendChild(li);
        addListeners(tripId, tripleg, isFirst, isLast);
      }
    },

    addListeners: addListeners

  };
};