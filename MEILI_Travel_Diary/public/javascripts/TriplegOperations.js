/*
MEILI Travel Diary - web interface that allows to annotate GPS trajectories
fused with accelerometer readings into travel diaries

 Copyright (C) 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/
 Copyright (C) 2016 adIT AI - https://github.com/adIT-AI

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


/**
 * Based on the user's interaction with the map, a new point is added to the tripleg. The time is extrapolated based on the neighboring points.
 * @param newPointLatLng - position of the new point
 * @param triplegOfPoint - the tripleg to which the interacted line belongs to
 */
function addPointToTripleg(newPointLatLng, triplegOfPoint, leafletId){
    var avgTime;

    var distanceToLine = pDistance(newPointLatLng.lat, newPointLatLng.lng, triplegOfPoint.points[0].lat,triplegOfPoint.points[0].lon,
        triplegOfPoint.points[1].lat,triplegOfPoint.points[1].lon);
    var idx=0;
    for (var j=0; j< triplegOfPoint.points.length-1;j++){

        if (pDistance(newPointLatLng.lat, newPointLatLng.lng, triplegOfPoint.points[j].lat,triplegOfPoint.points[j].lon,
                triplegOfPoint.points[j+1].lat,triplegOfPoint.points[j+1].lon)<=distanceToLine) {
            distanceToLine = pDistance(newPointLatLng.lat, newPointLatLng.lng, triplegOfPoint.points[j].lat,triplegOfPoint.points[j].lon,
                triplegOfPoint.points[j+1].lat,triplegOfPoint.points[j+1].lon);
            idx=j;
            var time1 = triplegOfPoint.points[j].time;
            var time2 = triplegOfPoint.points[j+1].time;
            avgTime = (time1+time2)/2;
            avgTime = parseInt(avgTime);
        }
    }

    var newObject ={};
    newObject.id = -1;//triplegOfPoint.points[idx].id+'a'+triplegOfPoint.points[idx+1].id;
    newObject.lat = newPointLatLng.lat;
    newObject.lon = newPointLatLng.lng;
    newObject.time = avgTime;
    newObject.addedByUser = 'true';
    newObject.from_id = triplegOfPoint.points[idx].id;
    newObject.to_id = triplegOfPoint.points[idx+1].id;

    // push the update to the tripleg

    var passedObject= {};
    passedObject.updatedPoint = newObject;
    passedObject.idx = idx+1;
    passedObject.leafletId = leafletId;
    updateTripleg(triplegOfPoint, "addPointAtIndex", passedObject);
   // triplegOfPoint.points.splice(idx+1,0,newObject);
}

function movePointsToTempArray(backupTrip, backupTripleg, startTimeNew, startTimeOld, endTimeNew, endTimeOld){

    console.log(startTimeNew);
    console.log(startTimeOld);
    console.log(endTimeNew);
    console.log(endTimeOld);

    console.log(backupTripleg);

    console.log(jQuery.extend(true,{}, backupTrip));

    var lastPointLastTripleg = currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1];
    var prevPassive = getPrevBackupPassiveTripleg(backupTripleg.triplegid, backupTrip);
    var nextPassive = getNextBackupPassiveTripleg(backupTripleg.triplegid, backupTrip);

    if (startTimeNew==null&&(endTimeNew != endTimeOld)){

        console.log("Start time null");
        console.log(new Date(endTimeNew)+"!="+ new Date(endTimeOld)+" is "+ (new Date(endTimeNew)!=new Date(endTimeOld)));
        //only end time has changed

        // check if points need to be moved into tripleg

        //remove last object

        var nextLeg = getNextBackupTripleg(backupTripleg.triplegid, backupTrip);

        console.log(nextPassive);

        // tripleg.points.splice(tripleg.points.length - 1);

        if (nextPassive!=undefined){
        for (var i=0; i<nextPassive.points.length; i++){
            var pointDate = nextPassive.points[i].time;
            if (pointDate>startTimeOld && pointDate< endTimeNew){
                backupTripleg.points.push(nextPassive.points[i]);
                nextPassive.points.splice(i,1);
                i--;
            }
        }

        // check if points need to be moved outside of tripleg
        for (var i=0; i<backupTripleg.points.length;i++){
            //console.log(tripleg);
            var pointDate = backupTripleg.points[i].time;
            console.log(backupTripleg.points[i].id+" "+pointDate+" > "+endTimeNew);
            if (pointDate>endTimeNew){
                console.log("entered");
                nextPassive.points.push(backupTripleg.points[i]);
                backupTripleg.points.splice(i,1);
                i--;
            }
        }

            if (nextPassive.points.length==0||nextPassive.points.length==1) {
                var newPoint = new Object();
                newPoint.id = nextLeg.points[0].id;
                newPoint.time = endTimeNew;
                newPoint.lat = nextLeg.points[0].lat;
                newPoint.lon= nextLeg.points[0].lon;
                nextPassive.points[0]=newPoint;
            }

            nextPassive.points.sort(compareTimeElem);
        }


        // tempArray.sort(compareTimeElem);

         /*if (nextLeg!=undefined)
        {
            var newPoint = new Object();
            newPoint.id = nextLeg.points[0].id;
            newPoint.time = endTimeNew;
            newPoint.lat = nextLeg.points[0].lat;
            newPoint.lon= nextLeg.points[0].lon;
            backupTripleg.points.push(newPoint);
        }
        else{
            var newPoint = new Object();
            newPoint.id = lastPointLastTripleg.id;
            newPoint.time = endTimeNew;
            newPoint.lat = lastPointLastTripleg.lat;
            newPoint.lon= lastPointLastTripleg.lon;
            backupTripleg.points.push(newPoint);
        }*/


        console.log(backupTripleg);
         // consistency with the next trip's first point
    }



    if (endTimeNew==null && (startTimeNew!=startTimeOld)){
        // DOES THIS EVER HAPPEN
        console.log(new Date(startTimeNew)+"!="+ new Date(startTimeOld)+" is "+ (new Date(startTimeNew)!=new Date(startTimeOld)));
        console.log("End time null");
        //only start time has changed
        // check if points need to be moved into tripleg

        // only for the first tripleg

        if (prevPassive!=undefined){
        for (var i=prevPassive.points.length-1; i>0; i--){
            var pointDate = prevPassive.points[i].time;
            if (pointDate> startTimeNew && pointDate<endTimeOld){
                backupTripleg.points.splice(1,0,prevPassive.points[i]);
                prevPassive.points.splice(i,1);
                //i--;
            }
        }

        for (var i=0; i<backupTripleg.points.length;i++){
            var pointDate = backupTripleg.points[i].time;
             console.log(backupTripleg.points[i].id+" "+pointDate+" < "+startTimeNew);
            if (pointDate< startTimeNew){
                prevPassive.points.push(backupTripleg.points[i]);
                backupTripleg.points.splice(i,1);
                i--;
            }
                  }
            }
            else {
            console.log('checking run through');
                var runThrough = true;
                for (var i=0; i<backupTripleg.points.length;i++){
                    var pointDate = backupTripleg.points[i].time;
                    console.log(backupTripleg.points[i].id+" "+pointDate+" < "+startTimeNew);
                    console.log(backupTripleg.points[i].id+" "+new Date(pointDate)+" < "+new Date(startTimeNew));
                    if (pointDate < startTimeNew){
                        runThrough = false;
                        // prevPassive.points.push(backupTripleg.points[i]);
                        console.log('removing '+ backupTripleg.points[i].id+" "+new Date(pointDate));
                        backupTripleg.points.splice(i,1);
                        i--;
                    }
                }
            console.log('checked run through '+runThrough);
            if (runThrough){backupTripleg.points[0].time=startTimeNew;}

            }

        }

    // Guaranteeing last point of tripleg is the first point of passive tripleg
    if (nextPassive!=undefined){
        console.log("next passive exists")
        if (backupTripleg.points[backupTripleg.points.length-1].id != nextPassive.points[0].id) {
            console.log("adding point to end");
            var pushPoint = jQuery.extend(true, {}, nextPassive.points[0]);
            if (endTimeNew!=null) pushPoint.time = endTimeNew;
            backupTripleg.points.push(pushPoint);
            console.log(nextPassive.points[0]);
        }
    }
    // Guaranteeing first point of tripleg is the last point of passive tripleg
    if (prevPassive!=undefined){
        console.log("prev passive exists");
        if (backupTripleg.points[0].id != prevPassive.points[prevPassive.points.length-1].id) {
            console.log("adding point to begining");
            console.log(prevPassive.points[prevPassive.points.length-1]);
            var splicePoint = jQuery.extend(true, {}, prevPassive.points[prevPassive.points.length-1]);
            if (startTimeNew!=null) splicePoint.time = startTimeNew;
            backupTripleg.points.splice(0,0, splicePoint);
        }
    }


    console.log(nextPassive);
    console.log(prevPassive);
    /*if (nextPassive!=undefined) {

    }*/
    if (prevPassive!=undefined) {
        if (prevPassive.points.length==0){
            var newPoint = new Object();
            newPoint.id = backupTripleg.points[backupTripleg.points.length-1].id;
            newPoint.time = startTimeNew;
            newPoint.lat = backupTripleg.points[backupTripleg.points.length-1].lat;
            newPoint.lon= backupTripleg.points[backupTripleg.points.length-1].lon;
            prevPassive.points[0]=newPoint;
        }
    }

    console.log(backupTripleg);
    console.log(backupTrip);

}

function getNextBackupTripleg(triplegid, backupTrip){
    for (var j=0; j<backupTrip.triplegs.length;j++){
        if (backupTrip.triplegs[j].triplegid==triplegid){
            return backupTrip.triplegs[j+2];
        }
    }
    return undefined;
}

function getNextBackupPassiveTripleg(triplegid, backupTrip){
    for (var j=0; j<backupTrip.triplegs.length;j++){
        if (backupTrip.triplegs[j].triplegid==triplegid){
            return backupTrip.triplegs[j+1];
        }
    }
    return undefined;
}

function getPrevBackupPassiveTripleg(triplegid, backupTrip){
    console.log(backupTrip);
    for (var j=0; j<backupTrip.triplegs.length;j++){
        if (backupTrip.triplegs[j].triplegid==triplegid){
            return backupTrip.triplegs[j-1];
        }
    }
    return undefined;
}

function getPrevBackupTripleg(triplegid, backupTrip){
    for (var j=0; j<backupTrip.triplegs.length;j++){
        if (backupTrip.triplegs[j].triplegid==triplegid){
            return backupTrip.triplegs[j-2];
        }
    }
    return undefined;
}

function updateTimeOfTripleg(trip, tripleg, newStartTime, newEndTime, prevTripEnd, nextTripStart) {


    // all these concepts will be applied to backups of entities to allow for a proper definition of "CANCEL"

    console.log(jQuery.extend(true,{}, trip));
    var backupTrip = jQuery.extend(true,{}, trip);
    console.log(backupTrip);
    var backupTripleg;
    for (var j in backupTrip.triplegs) if (backupTrip.triplegs[j].triplegid==tripleg.triplegid) backupTripleg = backupTrip.triplegs[j];

    var triplegStartDate = tripleg.points[0].time;
    var triplegEndDate = tripleg.points[tripleg.points.length - 1].time;
    var triplegsInside = [];
    var startBoundary = {};
    startBoundary.points = [];
    var stopBoundary = {};
    stopBoundary.points = [];
    var shouldCheck = false;

    console.log("Checking");
    console.log(nextTripStart);
    console.log(newStartTime);

    console.log(newStartTime);
    console.log(triplegStartDate);
    console.log(newEndTime);
    console.log(triplegEndDate);

    var fooTest = false;

    if (nextTripStart == undefined) fooTest = true;
    // else if (isNaN(nextTripStart.getTime())) fooTest = true;

    if ((newStartTime == null && (newEndTime <= nextTripStart || fooTest))&& (newEndTime!=triplegEndDate)) {
        console.log("New start time is null");
        shouldCheck = true;
        // modifying only end time
        for (var j in backupTrip.triplegs) {

            if (backupTrip.triplegs[j].type_of_tripleg == 1) {
                console.log("checking tripleg " + backupTrip.triplegs[j].triplegid + " against " + backupTripleg.triplegid);

                console.log(j);

                if (backupTrip.triplegs[j].triplegid != backupTripleg.triplegid) {

                    var startPointDate = backupTrip.triplegs[j].points[0].time;
                    var endPointDate = backupTrip.triplegs[j].points[backupTrip.triplegs[j].points.length - 1];

                    /*console.log("checking tripleg "+ trip.triplegs[j].triplegid );
                     console.log("checking time "+ trip.triplegs[j].points[0].time+" against "+ newEndTime);*/

                    console.log('Earlier check ' + endPointDate + '<=' + newEndTime + '&&' + startPointDate + '>=' + triplegStartDate);
                    console.log('Later check ' + startPointDate + '<=' + newEndTime + '&&' + endPointDate + '>=' + newEndTime);
                    // < because it is earlier
                    if (endPointDate <= newEndTime && startPointDate >= triplegStartDate) {
                        console.log("tripleg " + backupTrip.triplegs[j].triplegid + " completely within the new time");
                        triplegsInside.push(backupTrip.triplegs[j]);
                        // treatNextAsBoundary = true;
                        stopBoundary = backupTrip.triplegs[parseInt(j) + 2];
                    }
                    else if (startPointDate <= newEndTime && endPointDate >= newEndTime) {
                        console.log("tripleg " + backupTrip.triplegs[j].triplegid + " partially within the new time");
                        //stopBoundary = jQuery.extend({}, backupTrip.triplegs[j]);
                        stopBoundary = backupTrip.triplegs[j];
                    }
                }
                else {
                    console.log(backupTripleg);
                    movePointsToTempArray(backupTrip, backupTripleg, null, triplegStartDate, newEndTime, triplegEndDate);
                    console.log('move points to temp array');
                }
            }
        }
        console.log("Number of trips inside " + triplegsInside.length);
        //console.log(stopBoundary);
        if (stopBoundary.triplegid != undefined || jQuery.isEmptyObject(stopBoundary)) {
            /*if (triplegsInside.length != 0) {
                // showAndAddDataForLongModalV2(tripleg, triplegStartDate, newEndTime, startBoundary, stopBoundary, triplegsInside, triplegStartDate, triplegEndDate);
            }
            else {
                //showAndAddDataForModal(tripleg, triplegStartDate, newEndTime, startBoundary, stopBoundary, triplegStartDate, triplegEndDate)
            }*/
        }
        else {
            // TODO Move points between trips
            //backupTripleg.points[backupTripleg.points.length - 1].time = newEndTime.toString();
            console.log("Should move points between "+tripleg.points[tripleg.points.length-1].time+" and "+ newEndTime);
            movePointsToNextPassiveTrip(backupTrip, newEndTime)
        }
    }

    if ((newEndTime == null && ((newStartTime >= prevTripEnd) || (newStartTime!=triplegStartDate)))) {
        console.log("New end time is null and prev trip end earlier than new start time");
        shouldCheck=true;
        // modifying only start time
        for (var j in backupTrip.triplegs) {
            console.log("checking tripleg " + backupTrip.triplegs[j].triplegid + " against " + backupTripleg.triplegid);

            if (backupTrip.triplegs[j].triplegid != backupTripleg.triplegid) {

                if (backupTrip.triplegs[j].type_of_tripleg == 1) {
                    var startPointDate = backupTrip.triplegs[j].points[0].time;
                    var endPointDate = backupTrip.triplegs[j].points[backupTrip.triplegs[j].points.length - 1].time;

                    console.log("checking tripleg " + backupTrip.triplegs[j].triplegid);
                    console.log("checking time " + backupTrip.triplegs[j].points[0].time + " against " + newStartTime);

                    // > because it is later
                    if (startPointDate >= newStartTime && startPointDate <= triplegStartDate) {
                        console.log("tripleg " + backupTrip.triplegs[j].triplegid + " completely within the new time");
                        triplegsInside.push(backupTrip.triplegs[j]);
                        //startBoundary = jQuery.extend({}, backupTrip.triplegs[parseInt(j) - 1]);
                        startBoundary = backupTrip.triplegs[parseInt(j) - 2];
                    }
                    else if (endPointDate >= newStartTime && endPointDate <= triplegStartDate) {
                        console.log("tripleg " + backupTrip.triplegs[j].triplegid + " partially within the new time");
                        //startBoundary = jQuery.extend({}, backupTrip.triplegs[j]);
                        startBoundary =  backupTrip.triplegs[j];
                    }
                }
            }
            /*else{
             console.log("move points to temp array");
             movePointsToTempArray(tripleg, newStartTime, triplegStartDate, null, triplegEndDate);
             }*/
        }

        if (startBoundary.triplegid != undefined || jQuery.isEmptyObject(startBoundary)) {
            if (triplegsInside.length != 0) {
                // showAndAddDataForLongModalV2(tripleg, newStartTime, triplegEndDate, startBoundary, stopBoundary, triplegsInside, triplegStartDate, triplegEndDate);
            }
            else {
                // showAndAddDataForModal(tripleg, newStartTime, triplegEndDate, startBoundary, stopBoundary, triplegStartDate, triplegEndDate);
            }
        }
        else {
            console.log("Should move points between "+tripleg.points[0].time+" and "+ newStartTime);
            //TODO Move points between trips
            movePointsToPrevPassiveTrip(backupTrip, newStartTime);
            // backupTripleg.points[0].time = newStartTime.toString();
            // updateTransitionPanel(tripleg.triplegid);
        }
    }

    if (shouldCheck){
    movePointsToTempArray(backupTrip, backupTripleg, newStartTime, triplegStartDate, newEndTime, triplegEndDate);

    console.log("before");
    console.log(backupTripleg);
    console.log("after");
    console.log(tripleg);

    console.log("before");
    console.log(backupTrip);
    console.log("after");
    console.log(trip);
    // ALL THE OPERATIONS HAVE BEEN PERFORMED ON CLONED OBJECTS -> PUSH FOR CONFIRMATION
    pushTriplegChangeForConfirmation(backupTrip, trip, backupTripleg, tripleg, startBoundary, stopBoundary, triplegsInside, newStartTime, newEndTime);
    }
}

function movePointsToNextPassiveTrip(backupTrip, newEndTime) {
    // TODO two trips get updated here it should get pushed to the database

    console.log('move points to nexxt passive');
    var checkTest = serverResponse.trips[getNextTrip(backupTrip.tripid)];
    console.log(checkTest);
    if (checkTest==undefined){
        backupTrip.triplegs[backupTrip.triplegs.length-1].points[backupTrip.triplegs[backupTrip.triplegs.length-1].points.length-1].time = newEndTime;
    }
    else
    {

        var lastDateOfBackupTrip = backupTrip.triplegs[backupTrip.triplegs.length-1].points[backupTrip.triplegs[backupTrip.triplegs.length-1].points.length-1].time;

        // deleting the last point
        backupTrip.triplegs[backupTrip.triplegs.length-1].points.splice(backupTrip.triplegs[backupTrip.triplegs.length-1].points.length-1,1);

        // backing up next trip's first point time
        var nextTripFirstDate = serverResponse.trips[getNextTrip(backupTrip.tripid)].triplegs[0].points[0].time;

        // moving from the trip to the next passive
        if(newEndTime<lastDateOfBackupTrip){
            var takeFromTrip = backupTrip.triplegs[backupTrip.triplegs.length-1];
            var giveToTrip = serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)];
                for (var j=takeFromTrip.points.length-1; j>=0;j--){
                    if (takeFromTrip.points[j].time>newEndTime){
                        console.log('add point with id '+takeFromTrip.points[j].id);
                        giveToTrip.triplegs[0].points.splice(0,0, jQuery.extend(true,{},takeFromTrip.points[j]));
                        takeFromTrip.points.splice(j,1);
                        //j--;
                    }
                }
        }
        else{
        // moving from the next passive to the trip
            var takeFromTrip = serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)];
            var giveToTrip = backupTrip.triplegs[backupTrip.triplegs.length-1];
            for (var j=0;j<takeFromTrip.triplegs[0].points.length;j++){
                if (takeFromTrip.triplegs[0].points[j].time<newEndTime){
                    giveToTrip.points.push(jQuery.extend(true,{},takeFromTrip.triplegs[0].points[j]));
                    takeFromTrip.triplegs[0].points.splice(j,1);
                    j--;
                }
            }
        }

        //clustering the content of the passive points

        var clustered_point = {};
        var lat = 0;
        var lon = 0;
        var cnt = 0;

       // serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)].triplegs[0].points.order(compareTimeElem());

        for (var j=0; j<serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)].triplegs[0].points.length; j++){
            cnt ++;
            lat = lat+serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)].triplegs[0].points[j].lat;
            lon = lon+serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)].triplegs[0].points[j].lon;
        }

        var clusterLat = lat /cnt;
        var clusterLon = lon / cnt;
        clustered_point.lat = clusterLat;
        clustered_point.lon = clusterLon;
        clustered_point.time = newEndTime;
        clustered_point.id = serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)].triplegs[0].points[0].id;

        backupTrip.triplegs[backupTrip.triplegs.length-1].points.push(clustered_point);

        var clustered_point_next_trip = jQuery.extend(true, {}, clustered_point);
        var nextTrip = serverResponse.trips[getNextTrip(backupTrip.tripid)];

        clustered_point_next_trip.id = nextTrip.triplegs[0].points[0].id;
        clustered_point_next_trip.time = nextTripFirstDate;

        console.log(serverResponse);

        nextTrip.triplegs[0].points.splice(0,1,clustered_point_next_trip);
        //nextTrip.triplegs[0].points[0].id =clustered_point.id;

        pushTripModification(null, nextTrip,"upsert", serverResponse.trips[getNextPassiveTrip(backupTrip.tripid)]);
        // pushTripModification(null, ,"upsert");
    }
    currentTrip.defined_by_user=1;
    console.log('just pushed new trip');
    console.log(jQuery.extend(true, {}, backupTrip));
    pushTripModification(null,backupTrip,"upsert");
}

function movePointsToPrevPassiveTrip(backupTrip, newStartTime){
    // TODO two trips get updated here it should get pushed to the database
    console.log('move points to prev passive');
    // check if this is not the first trip
    if (getPrevTrip(backupTrip.tripid)>=0){
    // always remove the first point
    console.log("Moving points passive");
    var prevTrip = serverResponse.trips[getPrevTrip(backupTrip.tripid)];
    var backupTime = prevTrip.triplegs[prevTrip.triplegs.length-1].points[prevTrip.triplegs[prevTrip.triplegs.length-1].points.length-1].time;
    backupTrip.triplegs[0].points.splice(0,1);

    if (newStartTime>backupTrip.triplegs[0].points[0].time){
        var takeFromTrip = backupTrip.triplegs[0];
        var giveToTrip = serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)];
        //moved to a later time -> should move points from the active trip to the passive trip
    for (var j=0; j<takeFromTrip.points.length;j++){
        if (takeFromTrip.points[j].time<newStartTime){
            giveToTrip.triplegs[0].points.push(jQuery.extend(true, {}, takeFromTrip.points[j]));
            takeFromTrip.points.splice(j,1);
            j--;
            }
        }
    }
    else{
        var takeFromTrip = serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0];
        console.log(takeFromTrip);
        var giveToTrip = backupTrip.triplegs[0];
        //moved to an earlier time -> should move points from the passive trip to the active trip
        for (var j=takeFromTrip.points.length-1; j>=0;j--){
            if (takeFromTrip.points[j].time>newStartTime){
                console.log('giving back');
                console.log(takeFromTrip.points[j]);
                giveToTrip.points.splice(0,0,jQuery.extend(true, {}, takeFromTrip.points[j]));
                takeFromTrip.points.splice(j,1);
                //j--;
            }
        }
    }

    var clustered_point = {};
    var lat = 0;
    var lon = 0;
    var cnt = 0;


    for (var j=0; j<serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0].points.length; j++){
        cnt ++;
        lat = lat+serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0].points[j].lat;
        lon = lon+serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0].points[j].lon;
    }

    var clusterLat = lat /cnt;
    var clusterLon = lon / cnt;

    clustered_point.id = serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0].points[serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0].points.length-1].id;
    clustered_point.lat = clusterLat;
    clustered_point.lon = clusterLon;
    clustered_point.time = newStartTime;

    backupTrip.triplegs[0].points.splice(0,0, clustered_point);

    // delete the last one

        // serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0].points.order(compareTimeElem());

    var clustered_point_prev_trip = jQuery.extend(true, {}, clustered_point);
    clustered_point_prev_trip.time = backupTime;
    clustered_point_prev_trip.id = prevTrip.triplegs[prevTrip.triplegs.length-1].points[prevTrip.triplegs[prevTrip.triplegs.length-1].points.length-1].id;

    prevTrip.triplegs[prevTrip.triplegs.length-1].points.splice(prevTrip.triplegs[prevTrip.triplegs.length-1].points.length-1,1,clustered_point_prev_trip);
        // pushTripModification(null,prevTrip,"upsert");

        console.log(serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)]);
        //pushTriplegModification(null,serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].triplegs[0],"upsert",serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)].tripid);
        var request = pushTripModification(null, serverResponse.trips[getPrevPassiveTrip(backupTrip.tripid)],"upsert");
        $.when(request).done(function (){
            pushTripModification(null, prevTrip,"upsert");}
        );
    }
    else {
        // backupTrip.triplegs[0].points[0].time = newStartTime;
    }
    currentTrip.defined_by_user=1;
    console.log('just pushed new trip');
    console.log(jQuery.extend(true, {}, backupTrip));
};

function pushTriplegChangeForConfirmation(backupTrip, trip, backupTripleg, tripleg, startBoundary, stopBoundary, triplegsInside, newStartTime, newEndTime){
    console.log(startBoundary);
    console.log(stopBoundary);
    console.log(triplegsInside);

    if (triplegsInside!=undefined){
        if (triplegsInside.length!=0){

            if (startBoundary.triplegid!=undefined || jQuery.isEmptyObject(startBoundary)){
                // only start modification
                addPointsWithinTriplegsToTriplegBefore(startBoundary, triplegsInside, backupTripleg.triplegid, backupTrip);
                movePointsBeforeBoundary(startBoundary, newStartTime, backupTripleg.triplegid, backupTrip);
                //  console.log(startBoundary);
                /*if (startBoundary.points.length>1)
                    updateRemoveRedraw(startBoundary);
                // else implies that it is the only trip
                else updateTransitionPanel(currentTrip.triplegs[0].triplegid);*/
            }

            if (stopBoundary.triplegid!=undefined || jQuery.isEmptyObject(stopBoundary)){
                addPointsWithinTriplegsToTriplegAfter(stopBoundary, triplegsInside, backupTripleg.triplegid, backupTrip);
                movePointsAfterBoundary(stopBoundary, newEndTime, backupTripleg.triplegid, backupTrip);
                //    console.log(stopBoundary);
                /*if (stopBoundary.points.length>1)
                    updateRemoveRedraw(stopBoundary);
                // else implies that it is the only trip
                else {
                    //updateRemoveRedraw(currentTrip.triplegs[0]);
                    updateTransitionPanel(currentTrip.triplegs[0].triplegid);
                }*/
            }

            console.log("THIS IS THE BACKUP TRIP");
            console.log(backupTrip);


            //TODO STILL NEED TO CHECK THIS
            console.log(triplegsInside);

            showShortModal(backupTrip, trip, backupTripleg, tripleg, startBoundary, stopBoundary, newStartTime, newEndTime,triplegsInside);
        }
        else {
            if ((startBoundary.points.length==0)&&(stopBoundary.points.length==0))
            {
                // perform changes

                for (var j=0; j < currentTrip.triplegs.length;j++){

                    if (currentTrip.triplegs[j].triplegid==backupTripleg.triplegid)
                    {
                        console.log(backupTripleg);
                        console.log(jQuery.extend(true,{},currentTrip));
                        currentTrip.triplegs[j]=backupTripleg;
                        tripleg=backupTripleg;
                        redrawOnly(currentTrip.triplegs[j]);
                        // TODO PUSH TRIPLEG MODIFICATION
                        pushTriplegModification(null, currentTrip.triplegs[j], 'upsert', currentTrip.tripid);
                        if (j==0||j==currentTrip.triplegs.length-1){
                            console.log('modfiying trip '+backupTrip);
                            pushTripModification(null,backupTrip,"upsert");
                        }
                    }
                }

                updateRemoveRedraw(tripleg);
                updateTransitionPanel(tripleg.triplegid);

                console.log(backupTrip);

                var prevPassive = getPrevBackupPassiveTripleg(backupTripleg.triplegid, backupTrip);
                var nextPassive = getNextBackupPassiveTripleg(backupTripleg.triplegid, backupTrip);

                console.log(prevPassive);
                console.log(nextPassive);
                if (prevPassive!=undefined)
                    {
                    console.log('prev pass');

                        for (var j=0; j < currentTrip.triplegs.length;j++){
                            console.log(currentTrip.triplegs[j].triplegid+'=='+prevPassive.triplegid);
                            if (currentTrip.triplegs[j].triplegid==prevPassive.triplegid)
                            {
                                console.log(currentTrip);
                                // TODO PUSH TRIPLEG MODIFICATION
                                currentTrip.triplegs[j]=prevPassive;
                                redrawOnly(currentTrip.triplegs[j]);
                                pushTriplegModification(null, currentTrip.triplegs[j], 'upsert', currentTrip.tripid);
                            }
                        }

                };

                if (nextPassive!=undefined){
                    console.log('next pass');
                    for (var j=0; j < currentTrip.triplegs.length;j++){

                        if (currentTrip.triplegs[j].triplegid==nextPassive.triplegid)
                        {
                            console.log(currentTrip);
                            currentTrip.triplegs[j]=nextPassive;
                            // TODO PUSH TRIPLEG MODIFICATION
                            redrawOnly(currentTrip.triplegs[j]);
                            pushTriplegModification(null, currentTrip.triplegs[j], 'upsert', currentTrip.tripid);
                        }
                    }

                };

            }
            else{
                if (startBoundary.triplegid!=undefined || jQuery.isEmptyObject(startBoundary)){
                    // only start modification
                    addPointsWithinTriplegsToTriplegBefore(startBoundary, triplegsInside, backupTripleg.triplegid, backupTrip);
                    movePointsBeforeBoundary(startBoundary, newStartTime, backupTripleg.triplegid, backupTrip);
                    //  console.log(startBoundary);
                    /*if (startBoundary.points.length>1)
                     updateRemoveRedraw(startBoundary);
                     // else implies that it is the only trip
                     else updateTransitionPanel(currentTrip.triplegs[0].triplegid);*/
                }

                if (stopBoundary.triplegid!=undefined || jQuery.isEmptyObject(stopBoundary)){
                    addPointsWithinTriplegsToTriplegAfter(stopBoundary, triplegsInside, backupTripleg.triplegid, backupTrip);
                    movePointsAfterBoundary(stopBoundary, newEndTime, backupTripleg.triplegid, backupTrip);
                    //    console.log(stopBoundary);
                    /*if (stopBoundary.points.length>1)
                     updateRemoveRedraw(stopBoundary);
                     // else implies that it is the only trip
                     else {
                     //updateRemoveRedraw(currentTrip.triplegs[0]);
                     updateTransitionPanel(currentTrip.triplegs[0].triplegid);
                     }*/
                }

                console.log("THIS IS THE BACKUP TRIP");
                console.log(backupTrip);

                console.log(triplegsInside);
                showShortModal(backupTrip,trip,backupTripleg, tripleg, startBoundary, stopBoundary, newStartTime, newEndTime,triplegsInside);
            }
        }
    }
}

function addPointsWithinTriplegsToTriplegBefore(startBoundary, triplegsInside, triplegid, backupTrip){
    console.log("BEFORE");
    console.log(backupTrip);
    console.log(startBoundary);
    if (jQuery.isEmptyObject(startBoundary)) {
        startBoundary.triplegid = triplegid;
        startBoundary.points=[];
    }
    for (var i in triplegsInside){

        /*if (getNextPassiveTripleg(triplegsInside[i].triplegid,backupTrip)!=undefined)
            startBoundary.points.concat(getNextPassiveTripleg(triplegsInside[i].triplegid,backupTrip).points);*/

        for (var j in triplegsInside[i].points){
            startBoundary.points.push(triplegsInside[i].points[j]);
        }
        for (var k in backupTrip.triplegs){
            if (backupTrip.triplegs[k].triplegid == triplegsInside[i].triplegid) backupTrip.triplegs.splice(k,2);}
    }

    for (var i=0; i< backupTrip.triplegs.length;i++ ){

        if (backupTrip.triplegs[i].triplegid==triplegid){
            console.log(backupTrip.triplegs[i]);
            console.log(backupTrip);
            if (backupTrip.triplegs[i-1]!=undefined){
                backupTrip.triplegs[i-1].points = [];
                backupTrip.triplegs[i-1].points[0] = startBoundary.points[startBoundary.points.length-1];
                console.log(backupTrip.triplegs[i-1]);
            }
        }
    }

    console.log("AFTER");
    console.log(startBoundary);
}

function addPointsWithinTriplegsToTriplegAfter(stopBoundary, triplegsInside,triplegid, backupTrip){
    console.log("BEFORE");
    console.log(backupTrip);
    console.log(stopBoundary);
    if (jQuery.isEmptyObject(stopBoundary)) {
        stopBoundary.triplegid = triplegid;
        stopBoundary.points=[];
        stopBoundary.mode = backupTrip.triplegs[backupTrip.triplegs.length-1].mode;
        stopBoundary.places = backupTrip.triplegs[backupTrip.triplegs.length-1].places;
    }
//    console.log(triplegsInside);

    if (triplegsInside!=undefined) {
        for (var i = triplegsInside.length - 1; i >= 0; i--) {
            if (getPrevBackupPassiveTripleg(triplegsInside[i], backupTrip)!=undefined)
            stopBoundary.points.unshift(getPrevBackupPassiveTripleg(triplegsInside[i], backupTrip).points);
            for (var j = triplegsInside[i].points.length - 1; j >= 0; j--) {
                stopBoundary.points.unshift(triplegsInside[i].points[j]);
            }


            for (var k in backupTrip.triplegs){
                if (backupTrip.triplegs[k].triplegid == triplegsInside[i].triplegid) backupTrip.triplegs.splice(k,2);
             /*   if (getPrevBackupPassiveTripleg(triplegsInside[i], backupTrip)!=undefined)
                if (backupTrip.triplegs[k].triplegid == getPrevBackupPassiveTripleg(triplegsInside[i], backupTrip).triplegid) backupTrip.triplegs.splice(k,1);
            */}

    //        backupTrip.triplegs.splice(i,1);
        }
    }

    console.log("AFTER");
    console.log(stopBoundary);
    console.log(backupTrip);
}

function movePointsBeforeBoundary(startBoundary, startTime, modifiedTripleg, backupTrip){
    var tripleg={};

    for (var i in backupTrip.triplegs){
        if (backupTrip.triplegs[i].triplegid == modifiedTripleg){
            tripleg = backupTrip.triplegs[i];
            for (var j= startBoundary.points.length-1 ; j>=0; j--){
                var pointDate = startBoundary.points[j].time;
                if (pointDate>=startTime){
                    backupTrip.triplegs[i].points.unshift(startBoundary.points[j]);
                    startBoundary.points.splice(j, 1);
                  //  j++;
                }
            }

            if (backupTrip.triplegs[parseInt(i-1)]!=undefined){
                backupTrip.triplegs[parseInt(i-1)].points[0] = backupTrip.triplegs[i].points[0];
            }
        }
    }
    startBoundary.points.push(tripleg.points[0]);
    tripleg.points[0].time = startTime;
    console.log(startBoundary);

    updateRemoveRedraw(tripleg);

}

function sanitize(tripleg){
    for (var i=0; i<tripleg.points.length;i++){
        if (tripleg.points[parseInt(i)-1]!=undefined){
            if (
                ((tripleg.points[parseInt(i)-1].time == tripleg.points[parseInt(i)].time) &&
                (tripleg.points[parseInt(i)-1].lat == tripleg.points[parseInt(i)].lat) &&
                (tripleg.points[parseInt(i)-1].lon == tripleg.points[parseInt(i)].lon)
                )
                ||(tripleg.points[parseInt(i)-1].id== tripleg.points[parseInt(i)].id)
            )
            {
                tripleg.points.splice(i,1);
                i--;
            }
        }
    }
}

function getNewTripId(randomId){
    var rId = new Object();
    rId.name = randomId;
    var exists = true;

    while (exists) {
        exists=false;
        for (var j in serverResponse.trips) {
            console.log("CHECKING "+serverResponse.trips[j].tripid+" = " + rId.name+" is "+ (serverResponse.trips[j].tripid==rId.name));
            if (serverResponse.trips[j].tripid==rId.name){
                console.log("FOUND "+ rId.name);
                exists=true;
            }
        }
        if (exists)
        rId.name = rId.name+'a';
    }

    console.log("returning "+rId.name);

    return rId.name;
}



function movePointsAfterBoundary(stopBoundary, endTime, modifiedTripleg, backupTrip){
    var tripleg={};
    for (var i in backupTrip.triplegs){
        if (backupTrip.triplegs[i].triplegid == modifiedTripleg){

            tripleg = backupTrip.triplegs[i];
            for (var j= 0; j<stopBoundary.points.length; j++){
                if (stopBoundary.points[j]!=undefined){

                    var pointDate = stopBoundary.points[j].time;

                console.log(pointDate+"<="+endTime);

                if (pointDate<=endTime){
                    backupTrip.triplegs[i].points.push(stopBoundary.points[j]);
                    stopBoundary.points.splice(j, 1);
                    j--;
                }
                }
            }

            if (backupTrip.triplegs[parseInt(i+1)]!=undefined){
                backupTrip.triplegs[parseInt(i+1)].points[0] = backupTrip.triplegs[i].points[backupTrip.triplegs[i].points.length-1];
            }
        }
    }

    stopBoundary.points.unshift(tripleg.points[tripleg.points.length-1]);

    tripleg.points[tripleg.points.length-1].time = endTime;



    console.log(stopBoundary);
    console.log(tripleg);
    console.log(backupTrip);

    // updateRemoveRedraw(tripleg);
}

/**
 * WILL BE PUSHED TO DATABASE
 * @param tripleg
 * @param type
 * @param extra
 */
function updateTripleg(tripleg, type, extra){

    console.log(extra);

    if (extra.updatedPoint!=undefined)
    extra.updatedPoint.triplegid = tripleg.triplegid;

    if (type == "addPointAtIndex")
    {
        // added new point
        operationArtificialLocation(extra.updatedPoint,"insert", tripleg, extra.idx, extra.leafletId);
 }

    if (type == "updatePointGeometry"){
        // updated the geometry of an old point
        extra.updatedPoint.lon = extra.newLon;
        extra.updatedPoint.lat = extra.newLat;
        operationArtificialLocation(extra.updatedPoint,"update");
    }

    if (type == "deletePoint"){
        var deletedId = tripleg.points[extra].id;
        var addedByUser = false;
        if (tripleg.points[extra].addedByUser!=undefined) addedByUser=true;
        console.log(deletedId);
        tripleg.points.splice(extra,1);
    //    console.log(extra);
        if (addedByUser)
        operationArtificialLocation(deletedId,"delete");
    }

    console.log(tripleg);
}

function compareTimeElem(a,b) {
    if (new Date(a.time) >new Date(b.time))
        return 1;
    if (new Date(a.time) < new Date(b.time))
        return -1;
    return 0;
}