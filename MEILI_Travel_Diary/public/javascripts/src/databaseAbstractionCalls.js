/*
 MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

 Copyright (C) 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/
 Copyright (C) 2016 Badger AB - https://github.com/Badger-MEILI

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */



function getJson(str) {
    try {
        JSON.parse(str+"");
    } catch (e) {
        return str;
    }
    return JSON.parse(str);
}


/**
 * Inserts an operation log in the database - useful for future reproductions of bugs
 * @param operation
 */
function logFrontEndOperation(user_id, operation){

    // TODO remove all the references to this function and replace with a proper library or drop logging alltogether
    /*console.log('front end log ', operation);
        var request = $.ajax({
            url: "/api/insertFrontEndLog",
            type: "POST",
            data: {user_id: user_id,
                operation: operation },
            cache: false
        });
    */
    //request.done(function(msg) {console.log('inserted front end log')});

    var request = $.ajax({});

    return request;
}

function logError(user_id, operation, fullStack){

    var fullStackSummary={};
    fullStackSummary.goto = fullStack.go_to_index;
    fullStackSummary.trips_to_process = fullStack.trips_to_process;
    fullStackSummary.trips=[];

    for (var i in fullStack.trips){

        fullStackSummary.trips[i]={};
        fullStackSummary.trips[i].tripid = fullStack.trips[i].tripid;
        fullStackSummary.trips[i].prev_trip_stop = fullStack.trips[i].prev_trip_stop;
        fullStackSummary.trips[i].prev_trip_place = fullStack.trips[i].prev_trip_place;
        fullStackSummary.trips[i].next_trip_start= fullStack.trips[i].next_trip_start;
        fullStackSummary.trips[i].purposeNp = fullStack.trips[i].purposes.length;
        fullStackSummary.trips[i].destination_placesNo = fullStack.trips[i].destination_places.length;
        if (fullStack.trips[i].triplegs!=null)
        fullStackSummary.trips[i].triplegNo = fullStack.trips[i].triplegs.length;
        else
            fullStackSummary.trips[i].triplegNo=0;
        fullStackSummary.trips[i].triplegs=[];

        for (var j in fullStack.trips[i].triplegs){
            try {
            fullStackSummary.trips[i].triplegs[j].triplegid = fullStack.trips[i].triplegs[j].triplegid;
            fullStackSummary.trips[i].triplegs[j].pointsNo = fullStack.trips[i].triplegs[j].points.length;
            fullStackSummary.trips[i].triplegs[j].placesNo = fullStack.trips[i].triplegs[j].places.length;}
            catch (error){

            }
        }
    }

    console.log('error log');
    var request = $.ajax({
        url: "/api/insertExceptionLog",
        type: "POST",
        data: {user_id: user_id,
            operation: operation.message,
            stack: JSON.stringify(fullStackSummary)},
        cache: false
    });

    request.done(function(msg) {console.log('inserted error log')
    alert('sorry, we have encountered an error, please log in again');
    window.location.replace("testmeili-stackth.rhcloud.com");
        });

    return request;
}

/**
 * Compares the state of the in-memory trip with the uploaded one in the database (mimics TDD)
 * @param updatedInMemoryTrip
 * @param updatedInDatabaseTrip
 */
function compareTrips(updatedInMemoryTrip, updatedInDatabaseTrip){

}

/**
 * Inserts a new POI in a database
 * @param POI
 */
function operationPOI(POI, operationName){

    console.log(POI);
    var name_ins = POI.name;
    var type_ins = POI.type;
    var lat_ins = POI.latitude;
    var lon_ins = POI.longitude;
    var userId2 = POI.userId;
    // INSERT

    if (operationName == "insert") {
        var request = $.ajax({
        url: "/api/insertPersonalPOI",
        type: "POST",
        data: {name_ins: name_ins,
            type_ins: type_ins,
            lat_ins: lat_ins,
            lon_ins: lon_ins,
            user_id:userId2},
            cache: false
        //contentType: 'application/json; charset=utf-8',
        //dataType: "json"
    });


    request.done(function(msg) {
        console.log(msg);
        POI.osm_id = getJson(msg.ap_insert_personal_poi);
        for (var j in currentTrip.destination_places){
            if (currentTrip.destination_places[j].name==POI.name) {
                POI.accuracy=100;
                POI.added_by_user=1;
                currentTrip.destination_places[j]= POI;
            }
        }
        generatePOIEditModal(POI);
        console.log(POI);
        insertedNewPoiMarkerAfterCall()
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
    });
    }

    // UPDATE

    if (operationName == "update") {
        var request = $.ajax({
            url: "/api/updatePersonalPOI",
            type: "POST",
            data: {osm_id: POI.osm_id,
                type_update: POI.type,
                name_update: POI.name,
                lat_update: POI.latitude,
                lon_update:POI.longitude,
            user_id :userId },
            cache: false
            //contentType: 'application/json; charset=utf-8',
            //dataType: "json"
        });


        request.done(function(msg) {
            console.log(msg);
            });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }
}

/**
 * Inserts a new POI in a database
 * @param POI
 */
function operationTransportationPOI(transportPOI, operationName, tripleg){
    //    osm_id bigint,
    //    type_ text,
    //    name_ text,
    //    lat_ double precision,
    //    lon_ double precision,
    //    declared_by_user boolean DEFAULT false,
    //    transportation_lines text

    // INSERT
        console.log(transportPOI.osm_id+" "+operationName);
     if (operationName == "insert") {
         // TODO THE DATABASE SHOULD GENERATE AN ID AND RETURN IT
         // TODO P2 A TRIPLEG MODIFICATION SHOULD ALSO IMPLY THE REDRAW / REMOVAL OF MARKERS
        var request = $.ajax({
            url: "/api/insertTransportationPOI",
            type: "POST",
            data: {id_ins: transportPOI.osm_id, type_ins: transportPOI.type, name_ins:transportPOI.name,
                lat_ins:transportPOI.lat , lon_ins: transportPOI.lon, transportation_lines: transportPOI.transport_lines,
                transport_types : transportPOI.transport_types, user_id:transportPOI.userId},
            cache: false
            //contentType: 'application/json; charset=utf-8',
            //dataType: "json"
        });


        request.done(function(msg) {
            transportPOI.osm_id = msg.ap_insert_transportation_poi;
            insertedNewTransitionMarkerAfterCall(transportPOI);

            console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }

    // UPDATE

    if (operationName == "update") {
        var request = $.ajax({
            url: "/api/updateTransportationPOI",
            type: "POST",
            data: {id_ins: transportPOI.osm_id, type_ins: transportPOI.type, name_ins:transportPOI.name,
                lat_ins:transportPOI.lat , lon_ins: transportPOI.lon, transportation_lines: transportPOI.transport_lines,
                transport_types : transportPOI.transport_types, user_id:transportPOI.userId},
            cache: false
            //contentType: 'application/json; charset=utf-8',
            //dataType: "json"
        });


        request.done(function(msg) {
            console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }
}

function operationArtificialLocation(location, operation, tripleg, idx,leafletId){

    console.log(location);
    //    id text,
    //    latitude_ double precision,
    //    longitude_ double precision,
    //    tripleg_id text,
    //    time_ bigint

    if (location.time!=undefined)
    var fooDate = new  Date(location.time);

    console.log(fooDate);
    console.log(location.time);

    // INSERTED
    if (operation=="insert"){
        var request = $.ajax({
            url: "/api/insertArtificialPoint",
            type: "POST",
            data: {latitude: location.lat, longitude:location.lon,
                userId: userId, time: fooDate.valueOf(), from_id:location.from_id, to_id: location.to_id},
            cache: false
        });


        request.done(function(msg) {
            console.log(msg);
            location.id = msg.ap_insert_artificial_user_point;
            console.log(location);
            tripleg.points.splice(idx, 0, location);
            updatePolyline(leafletId);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }

    // DELETED

    if (operation=="delete"){
        var request = $.ajax({
            url: "/api/deleteArtificialPoint",
            type: "POST",
            data: {id: location, user_id:userId},
            cache: false
        });


        request.done(function(msg) {
            console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }

    // UPDATED
    if (operation=="update"){
        var request = $.ajax({
            url: "/api/updateArtificialPoint",
            type: "POST",
            data: {id: location.id, latitude: location.lat, longitude:location.lon, user_id:userId},
            cache: false
        });


        request.done(function(msg) {
            console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }
}

function pushTriplegModificationReplace(replacedTripleg, replacedPartA, tripId, replacedPartB){

    // first delete the original tripleg
    console.log('deleting exiting tripleg '+replacedTripleg.triplegid);
    var request = $.ajax({
        url: "/api/deleteTripleg",
        type: "POST",
        data: {tripleg_id: replacedTripleg.triplegid, user_id:userId},
        cache: false
    });

    var request3 = undefined;
    var request2 = undefined;

     request.done(function(msg) {
        console.log(msg);
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
    });


    $.when(request).done(function (){
        request2 = pushTriplegModification(null, replacedPartA, "upsert", tripId);
    });

    $.when(request2).done(function (){
        if (replacedPartB!=undefined)
        {
            request3 = pushTriplegModification(null, replacedPartB, "upsert", tripId);
            $.when(request3).done(function (){continueWithRequest(replacedPartA, replacedPartB);})
            }
        else {
            continueWithRequest(replacedPartA, replacedPartB);
        }
    });

    /*if (request3!=undefined){
    $.when(request, request2, request3).done(function (){
        alert('finished with 3 requests');
        continueWithRequest(replacedPartA, replacedPartB);
    })}
    else {
        $.when(request, request2).done(function (){
            alert('finished with 2 requests');
            continueWithRequest(replacedPartA, replacedPartB);
        })
    }*/
}

function getPurposeFromDb(userId, trip, poiId) {

    var request = $.ajax({
        url: "/api/getPurpose",
        type: "POST",
        data: {
            userId:userId,
            endtimeoftrip:trip.triplegs[trip.triplegs.length-1].points[trip.triplegs[trip.triplegs.length-1].points.length-1].time,
            poiid: trip.destination_places[0].osm_id
        },
        cache: false
    });


    request.done(function (msg) {
        console.log(msg);
        trip.purposes = getJson(msg[0].ap_get_purposes);
        document.getElementById("purposeSelect").outerHTML = getPurposeSelector(currentTrip.purposes);
        var selectPurposeOption = document.getElementById('purposeSelect');
        selectPurposeOption.onchange = purposeSelectListener;
        forceLoad();
    });
}
/**
 * Pushes the trip to the database (should be called only when the user finishes editing the trip and hits next)
 * @param trip
 */
function pushTripModification(oldTrip, newTrip, operation, passiveTrip){
    // if the trip already exists as being edited by the user, then the edits should be updated and not re-inserted
    // TODO --> ANY PUSH TO DATABASE SHOULD REPLACE IN-MEMORY VALUE AFTER PASSING THE CONSTRAINT
    //TODO TAKE INTO ACCOUNT A NEW EDITED / VERIFIED BY USER ATTRIBUTE

    // OPERATION -> UPSERT
    // trip_id text,
    //        user_id bigint,
    //        from_point_id bigint,
    //        to_point_id bigint,
    //        from_time timestamp without time zone,
    //        to_time timestamp without time zone,
    //        type_of_trip smallint,
    //        purpose_id integer,
    //        destination_poi_id bigint,
    //        length_of_trip double precision,
    //        duration_of_trip double precision,
    //        number_of_triplegs integer

    console.log(passiveTrip); console.log(jQuery.extend(true,{},passiveTrip));
    console.log(newTrip);console.log(jQuery.extend(true,{},newTrip));

    var firstPointOfTrip = newTrip.triplegs[0].points[0];
    var lastPointOfTrip = newTrip.triplegs[newTrip.triplegs.length-1].points[newTrip.triplegs[newTrip.triplegs.length-1].points.length-1];

    console.log(firstPointOfTrip);
    console.log(lastPointOfTrip);
    var typeOfTrip = 0;
    if (newTrip.type_of_trip!=undefined) {
        typeOfTrip = newTrip.type_of_trip;
    }else {
        typeOfTrip=1;
    }
    var poiID = -1;
    var destinationPOI = {};
    destinationPOI.accuracy=0;

    if (newTrip.destination_places!=null){

        if (Object.prototype.toString.call(newTrip.destination_places) === '[object Array]') {
            newTrip.destination_places.sort(comparePlace);
        }
        else {
            newTrip.destination_places = [];
            newTrip.destination_places[0] = {};
        }

        if (newTrip.destination_places[0].osm_id!=undefined) {
            if (newTrip.destination_places[0].accuracy>50)
            {
                poiID = newTrip.destination_places[0].osm_id;
                destinationPOI = jQuery.extend(true,{},newTrip.destination_places[0]);
            }
        }
    }

    if (newTrip.purposes!=null){
    newTrip.purposes.sort(comparePurpose);}

    console.log(jQuery.extend(true,{}, newTrip));

    if (operation==="upsert"){
    if (newTrip.defined_by_user==undefined){
        console.log('inserting trip '+newTrip.tripid);
        // THIS IS A NEW TRIP, NEEDS INSERTION
        var request = $.ajax({
            url: "/api/insertNewTrip",
            type: "POST",
            data: {trip_id:newTrip.tripid,user_id: userId, from_point_id: firstPointOfTrip.id, to_point_id: lastPointOfTrip.id,
                from_time: firstPointOfTrip.time, to_time: lastPointOfTrip.time, type_of_trip: typeOfTrip,
                purpose_id: newTrip.purposes[0].id, destination_poi_id: poiID,
                length_of_trip:0.0, duration_of_trip:0.0, number_of_triplegs: newTrip.triplegs.length},
            cache: false
        });


        request.done(function(msg) {

                newTrip.defined_by_user=1;
            console.log('set defined by user to true for '+jQuery.extend(true,{},newTrip).tripid);

                console.log('finished adding old trip');
                console.log('adding new trip');
                console.log(jQuery.extend(true,{}, newTrip));

                if (destinationPOI.accuracy < 50) {
                       if (newTrip.type_of_trip>0) {
                    var newRequest = $.ajax({
                        url: "/api/getPOIBuff",
                        type: "POST",
                        data: {
                            lat: currentTrip.triplegs[currentTrip.triplegs.length - 1].points[currentTrip.triplegs[currentTrip.triplegs.length - 1].points.length - 1].lat,
                            lon: currentTrip.triplegs[currentTrip.triplegs.length - 1].points[currentTrip.triplegs[currentTrip.triplegs.length - 1].points.length - 1].lon,
                            userId: userId
                        },
                        cache: false
                    });

                    newRequest.done(function (msg) {
                        console.log(msg);
                        currentTrip.destination_places = getJson(msg.ap_get_destinations_close_by);
                        //document.getElementById("placeSelect").innerHTML = getPlaceSelector(newTrip.destination_places);

                        document.getElementById("placeSelect").outerHTML = getPlaceSelector(currentTrip.destination_places);
                        var selectPlaceOption = document.getElementById('placeSelect');
                        selectPlaceOption.onchange = placeSelectListener;

                        console.log(jQuery.extend(true, {}, newTrip));
                        // newTrip.defined_by_user = 1;
                        var triplegRequest = pushTriplegModification(null, newTrip.triplegs[0], "upsert", newTrip.tripid);

                        triplegRequest.done(function (msg) {

                            if (passiveTrip != undefined) {
                                passiveTrip.type_of_trip = 0;
                                // passiveTrip.defined_by_user=1;
                                pushTripModification(oldTrip, passiveTrip, "upsert");
                            }
                        });


                    });
                }
                else {
                    var triplegRequest = pushTriplegModification(null, newTrip.triplegs[0], "upsert", newTrip.tripid);
                    triplegRequest.done(function (msg) {
                        if (passiveTrip != undefined) {
                            passiveTrip.type_of_trip = 0;
                            //passiveTrip.defined_by_user=1;
                            pushTripModification(oldTrip, passiveTrip, "upsert");
                        }
                    });
                }
            }
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }
    else{
        //THIS IS AN OLD TRIP, NEEDS UPDATE
        console.log('updating trip '+newTrip.tripid);

        var request = $.ajax({
            url: "/api/updateExistingTrip",
            type: "POST",
            data: {trip_id:newTrip.tripid,user_id: userId, from_point_id: firstPointOfTrip.id, to_point_id: lastPointOfTrip.id,
                from_time: firstPointOfTrip.time, to_time: lastPointOfTrip.time, type_of_trip: typeOfTrip,
                purpose_id: newTrip.purposes[0].id, destination_poi_id: newTrip.destination_places[0].osm_id,
                length_of_trip:0, duration_of_trip:0, number_of_triplegs: newTrip.triplegs.length},
            cache: false
        });


        request.done(function(msg) {
            console.log(msg);
            if (passiveTrip!=undefined) {
                console.log('pushing passive')
                passiveTrip.type_of_trip=0;
                var request = pushTripModification(oldTrip, passiveTrip, "upsert");

                $.when(request ).done(function (){
                    pushTriplegModification(null, passiveTrip.triplegs[0],"upsert", passiveTrip.tripid);
                });
            }

        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }
    }

    // OPERATION -> DELETE
    if (operation==="delete"){
        console.log('deleting trip '+newTrip.tripid);

        // THIS IMPLIES THAT THE TRIP DEFINITION EXISTS IN THE DATABASE, NO UPSERTS
        var request = $.ajax({
            url: "/api/deleteTrip",
            type: "POST",
            data: {trip_id:newTrip.tripid,user_id: userId},
            cache: false
        });


        request.done(function(msg) {
            console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }
    return request;
}

function pushTriplegModification(oldTripleg, newTripleg, operation, tripId, secondTripleg){

    // tripleg_id text,
    // trip_id text,
    // user_id bigint,
    // from_point_id bigint,
    // to_point_id bigint,
    // from_time timestamp without time zone,
    // to_time timestamp without time zone,
    // type_of_tripleg smallint,
    // transportation_type integer,
    // transition_poi_id bigint,
    // length_of_tripleg double precision,
    // duration_of_tripleg double precision

    // OPERATION -> UPSERT
    console.log(newTripleg);
    console.log(tripId);

    if (operation=="upsert"){
        var fistPointOfTripleg = newTripleg.points[0];
        var lastPointOfTripleg = newTripleg.points[newTripleg.points.length-1];

        var mode = -1;


        if (newTripleg.mode!=undefined){newTripleg.mode.sort(compare);

        if (newTripleg.mode[0]!=undefined){
            mode = newTripleg.mode[0].id;
        }
        }
        console.log(mode);

        var poiId = -1;

        if (newTripleg.triplegid==undefined) newTripleg.triplegid = tripId;
        if (newTripleg.type_of_tripleg==undefined) newTripleg.type_of_tripleg=0;
        if (newTripleg.places!=undefined)
        if (newTripleg.places[0]!=undefined)
        if (newTripleg.places[0].osm_id!=undefined) {
            console.log('checking');
            for (var j in newTripleg.places)
            if (newTripleg.places[j].chosen_by_user == true) {
                console.log('found point '+ newTripleg.places[j].osm_id+' at idx'+j);
                poiId = newTripleg.places[j].osm_id;
            }
        }

        if (newTripleg.defined_by_user==undefined){
            console.log("inserting new tripleg "+newTripleg.triplegid);
             // new trip should be inserted
            var request = $.ajax({
                url: "/api/insertNewTripleg",
                type: "POST",
                data: {tripleg_id: newTripleg.triplegid, trip_id: tripId, user_id: userId,
                from_point_id: fistPointOfTripleg.id, to_point_id: lastPointOfTripleg.id,
                from_time: fistPointOfTripleg.time, to_time: lastPointOfTripleg.time,
                type_of_tripleg:newTripleg.type_of_tripleg, transportation_type: mode,
                transportation_poi_id: poiId,
                length_of_tripleg: 0.0,
                duration_of_tripleg:0.0},
                cache: false
            });



            request.done(function(msg) {
                console.log(msg);
                var newRequest = $.ajax({
                    url: "/api/getTransportationPOIBuff",
                    type: "POST",
                    data: {lat: newTripleg.points[newTripleg.points.length-1].lat,
                        lon: newTripleg.points[newTripleg.points.length-1].lon, user_id:userId},
                    cache: false
                });

                newRequest.done(function (msg){
                    console.log(msg);
                    newTripleg.places = getJson(msg.ap_get_transit_pois_within_buffer);
                    if (secondTripleg!=undefined){
                        pushTriplegModification(oldTripleg, secondTripleg, "upsert", tripId);
                    }
                });
            });

            request.fail(function(jqXHR, textStatus) {
                console.log(textStatus);
            });
        }
        else {

            console.log('updating exiting tripleg '+newTripleg.triplegid+" tripid "+tripId);
            // old trip should be updated
            var request = $.ajax({
                url: "/api/updateExistingTripleg",
                type: "POST",
                data: {tripleg_id: newTripleg.triplegid, trip_id: tripId, user_id: userId,
                    from_point_id: fistPointOfTripleg.id, to_point_id: lastPointOfTripleg.id,
                    from_time: fistPointOfTripleg.time, to_time: lastPointOfTripleg.time,
                    type_of_tripleg:newTripleg.type_of_tripleg, transportation_type: mode,
                    transportation_poi_id: poiId,
                    length_of_tripleg: 0.0,
                    duration_of_tripleg:0.0},
                cache: false
            });


            request.done(function(msg) {
                newTripleg.defined_by_user = 1;
                console.log(msg);
                return;
            });

            request.fail(function(jqXHR, textStatus) {
                console.log(textStatus);
            });
        }
    }

    // OPERATION -> DELETE
    if (operation=="delete"){
        console.log('deleting exiting tripleg '+newTripleg.triplegid);
        var request = $.ajax({
            url: "/api/deleteTripleg",
            type: "POST",
            data: {tripleg_id: newTripleg.triplegid, user_id:userId},
            cache: false
        });


        request.done(function(msg) {
            console.log(msg);
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
    }

    newTripleg.defined_by_user = 1;
    return request;
}

function getNextTripAndAttachToResponse(response, userId, clusteredStartPoint ){

    console.log(response);

    if (response.trips[response.trips.length-1].triplegs!=undefined)
    var toTime = response.trips[response.trips.length-1].triplegs[response.trips[response.trips.length-1].triplegs.length-1].points[response.trips[response.trips.length-1].triplegs[response.trips[response.trips.length-1].triplegs.length-1].points.length-1].time;
    else{
        var toTime = response.trips[response.trips.length-2].triplegs[response.trips[response.trips.length-2].triplegs.length-1].points[response.trips[response.trips.length-2].triplegs[response.trips[response.trips.length-2].triplegs.length-1].points.length-1].time;
    }

    console.log(userId);
    console.log(toTime);

    var request = $.ajax({
        url: "/api/getNextTrip",
        type: "POST",
        data: {userId: userId, toTime:toTime},
        cache: false
    });


    request.done(function(msg2) {
        var msg = getJson(msg2);
        console.log(msg);
        console.log(msg.ap_get_next_trip);
        console.log(msg.ap_get_next_trip[0]);
        msg.ap_get_next_trip = getJson(msg.ap_get_next_trip);
        msg.ap_get_next_trip[0] = getJson(msg.ap_get_next_trip[0]);
        console.log(jQuery.extend(true, {}, response));
        console.log(msg.ap_get_next_trip);
        console.log(msg.ap_get_next_trip[0]);

        var insertFirst = true;
        var insertSecond = true;

        for (var j in response.trips){
            if (response.trips[j].tripid==msg.ap_get_next_trip[0].tripid) insertFirst=false;
            if (msg.ap_get_next_trip[1]!=undefined) {
                if (response.trips[j].tripid==msg.ap_get_next_trip[1].tripid) insertSecond=false;
            } else insertSecond=false;
        }

        if (insertFirst) {response.trips.push(msg.ap_get_next_trip[0]); if(response.trips.length>10) response.trips.splice(0,1);}
        if (insertSecond) {response.trips.push(msg.ap_get_next_trip[1]); if(response.trips.length>10) response.trips.splice(0,1);}


        /*
        if (response.trips.length>10)
        {
            response.trips.splice(0,2);
            console.log('splicing');
        }*/

        console.log(jQuery.extend(true,{},response));

        nextFunctionAfterResponse(clusteredStartPoint );
        //TODO do the same for the previous trip request
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
    });
}

function getPrevTripAndAttachToResponse(response, userId){

    console.log(response);

    var fromTime = currentTrip.triplegs[0].points[0].time;

    console.log(fromTime);

    var request = $.ajax({
        url: "/api/getPrevTrip",
        type: "POST",
        data: {userId: userId, fromTime:fromTime},
        cache: false
    });


    request.done(function(msg2) {
        var msg = getJson(msg2);
        msg.ap_get_prev_trip = getJson(msg.ap_get_prev_trip);
        console.log(msg);
        console.log(msg.ap_get_prev_trip);

        console.log(jQuery.extend(true, {}, response));

        var insertFirst = true;
        var insertSecond = true;

        if (msg.ap_get_prev_trip!=null)
        for (var j in response.trips){
            if(msg.ap_get_prev_trip[0]!=undefined) {if (response.trips[j].tripid==msg.ap_get_prev_trip[0].tripid) insertFirst=false;}
            else {insertFirst=false;}
            if(msg.ap_get_prev_trip[1]!=undefined) {if (response.trips[j].tripid==msg.ap_get_prev_trip[1].tripid) insertSecond=false;}
            else {insertSecond = false;}
        }
        else {insertFirst=false; insertSecond=false;}
        if (insertFirst) {response.trips.splice(0,0,msg.ap_get_prev_trip[0]);response.trips.splice(response.trips.length-1,1);}
        if (insertSecond) {response.trips.splice(0,0,msg.ap_get_prev_trip[1]);response.trips.splice(response.trips.length-1,1);}
        //response.trips.splice(response.trips.length-2,2);
        //TODO do the same for the previous trip request
        console.log(response);

        previousFunctionAfterAnswer();
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
    });
}