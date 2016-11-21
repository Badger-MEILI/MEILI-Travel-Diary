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


var pg = require('pg');
var Promise = require('es6-promise').Promise;

var credentials = require('./database');

var pool = new pg.Pool(credentials.poolConfig);

/**
 * String to json converter
 * @param str - string to be transformed to json
 * @returns {*} - json object / array
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
 * threshold for stop detection
 * @type {number}
 */
var thresholdSpeed = 0.5 / 1000;

/**
 * Clone object
 * @param obj
 * @param extObj
 * @returns {*}
 */
var extend = function(obj, extObj) {
    if (arguments.length > 2) {
        for (var a = 1; a < arguments.length; a++) {
            extend(obj, arguments[a]);
        }
    } else {
        for (var i in extObj) {
            obj[i] = extObj[i];
        }
    }
    return obj;
};

module.exports = {
    /**
     * Segmenter function to generate the trips for user given a stream of locations that don't belong to any trip
     * @param userId
     */
    generateTrips: function (userId) {


        console.log('generating trips for ' + userId);
        // counter for number of points clustered in the stop period
        var stopNumber = 0;

        // buffer objects used to declare trips
        var prevLocation = null;
        var endLocation = null;
        var firstLocation = null;
        var prevFrom = null;
        var prevTo = null;
        var results = [];
        var tripArray = [];

        // counter for number of points in trip
        var pointsInActiveTrip = 0;


            pool.query("select get_stream_for_stop_detection as response from apiv2.get_stream_for_stop_detection("+userId+");",
            function(err, result){



            // Gets the stream that has to be segmented
            for (var j in result.rows)
                results.push(result.rows[j]);

            if (err){
                console.log(err);
            }
            else{
                var points = getJson(results[0].response);


                if (points!=null)
                {
                    var min = points.length;
                    console.log('point support' + points.length);
                }
                else
                {
                    var min =-1;
                    console.log('no point support');
                }

                var skipOne = true;

                var centroidLat = 0;
                var centroidLon = 0;

                for (var i = 0; i < min; i++) {

                    var currentLocation = extend(points[i],{});
                    if (prevFrom == null) prevFrom = extend(currentLocation,{});

                    // accuracy filter for point
                    if (allConditionsAreMet(currentLocation)) {
                        pointsInActiveTrip++;
                        if (prevLocation == null) {
                            prevLocation = extend(currentLocation, {});
                        }
                        if (endLocation == null) {
                            endLocation = extend(currentLocation, {});
                        }
                        else {
                             if (conditionIsMet(endLocation, currentLocation, centroidLat, centroidLon, stopNumber)) {
                                 // this is a candidate stop location
                                 centroidLat = centroidLat+currentLocation.lat_;
                                 centroidLon = centroidLon+currentLocation.lon_;

                                 skipOne=true;
                                 stopNumber++;
                                 pointsInActiveTrip--;
                                // check for beginning of stop
                                if (stopNumber == 1) {
                                    firstLocation = extend(currentLocation,{});
                                    firstLocation.time_ = endLocation.time_;
                                    firstLocation.id_ = endLocation.id_;
                                }
                                else {
                                    endLocation =  extend(currentLocation,{});
                                }
                             }

                            else {
                                 // Location not a candidate for the stop period
                                 if (!skipOne) {

                                     if (stopNumber >= 1) {

                                         // if the stop was actually important
                                         if ((endLocation.time_ - firstLocation.time_) >= 5 * 60000 && (pointsInActiveTrip >= 4)) {
                                             centroidLat = 0;
                                             centroidLon = 0;
                                             skipOne = true;

                                             console.log('stop candidates');
                                             console.log(firstLocation.id+' '+firstLocation.time_);
                                             console.log(endLocation.id+' '+endLocation.time_);
                                             console.log('end of stop candidates');


                                             var fromID = extend(firstLocation, {});
                                             var toID = extend(endLocation, {});


                                             prevTo = extend(fromID, {});

                                             console.log('stop candidates from to');
                                             console.log(prevFrom.id+' '+prevFrom.time_);
                                             console.log(prevTo.id+' '+prevTo.time_);
                                             console.log('end of stop candidates from to');

                                             var activeTrip = {};
                                             activeTrip.user_id = userId;
                                             activeTrip.from_point_id = prevFrom.id_;
                                             activeTrip.to_point_id = prevTo.id_;
                                             activeTrip.from_time = prevFrom.time_;
                                             activeTrip.to_time = prevTo.time_;
                                             activeTrip.type_of_trip = 1;
                                             activeTrip.purpose_id = 0;
                                             activeTrip.destination_poi_id = 0;
                                             activeTrip.length_of_trip = 0;
                                             activeTrip.duration_of_trip = 0;
                                             activeTrip.number_of_triplegs = 1;

                                             var passiveTrip = {};
                                             passiveTrip.user_id = userId;
                                             passiveTrip.from_point_id = fromID.id_;
                                             passiveTrip.to_point_id = toID.id_;
                                             passiveTrip.from_time = fromID.time_;
                                             passiveTrip.to_time = toID.time_;
                                             passiveTrip.type_of_trip = 0;
                                             passiveTrip.purpose_id = 0;
                                             passiveTrip.destination_poi_id = 0;
                                             passiveTrip.length_of_trip = 0;
                                             passiveTrip.duration_of_trip = 0;
                                             passiveTrip.number_of_triplegs = 1;

                                             // makes sure that none of the trips are generated while still in a stop period
                                             if (activeTrip.from_time != activeTrip.to_time && passiveTrip.from_time != passiveTrip.to_time)
                                             {
                                                tripArray.push(activeTrip);
                                                tripArray.push(passiveTrip);
                                             }

                                             // insert active prevFrom -> prevTo
                                             //insert passive From -> To

                                             // prepare for next active prevFrom = To
                                             prevFrom = extend(toID, {});
                                             stopNumber = 0;
                                             pointsInActiveTrip = 0;
                                         }
                                         else {
                                             firstLocation = extend(currentLocation, {});
                                             endLocation = extend(currentLocation, {});
                                         }
                                     }

                                else {
                                    endLocation =  extend(currentLocation, {});
                                    }
                                 }
                                 skipOne=false;
                            }
                        }
                    }
                }
                console.log('generated '+tripArray.length+' trips for user '+ userId);
                generateSql(tripArray,userId);
            };
            });
    },
    generateTriplegsExposed: function (userId) {
        generateTriplegs(userId);
    }
};

/**
 * Generates the triplegs for a user
 * @param userId
 */
function generateTriplegs(userId) {

    var arrayOfTriplegs = [];
    var results = [];

        pool.query("select get_stream_for_tripleg_detection as response from apiv2.get_stream_for_tripleg_detection("+userId+");", function(err, result){

        for (var j in result.rows)
            results.push(result.rows[j]);

            if (err){
                console.log(err);
            }
            else
            {
            var firstPoint = null;
            var lastPoint = null;
            var prevPoint = null;
            var points = getJson(results[0].response);

            var goTo = points.length;

            for (var i = 0; i < goTo; i++) {
                if (points[i].accuracy_ <= 50) {
                    lastPoint =  extend(points[i],{});
                    if (firstPoint == null) {
                        firstPoint = extend(points[i],{});
                    }
                    if (prevPoint == null) {
                        prevPoint = extend(points[i],{});
                    }
                    else {
                        if (prevPoint.trip_id != lastPoint.trip_id) {
                            var tripleg = {};
                            tripleg.trip_id = prevPoint.trip_id;
                            tripleg.user_id = userId;
                            tripleg.from_point_id = firstPoint.id;
                            tripleg.to_point_id = prevPoint.id;
                            tripleg.from_time = firstPoint.time_;
                            tripleg.to_time = prevPoint.time_;
                            tripleg.type_of_tripleg = 1;
                            tripleg.transportation_type = 0;
                            tripleg.transition_poi_id = 0;
                            tripleg.length_of_tripleg = 0;
                            tripleg.duration_of_tripleg = 0;

                            arrayOfTriplegs.push(tripleg);
                            firstPoint = extend(points[i],{});
                        }
                    }
                    prevPoint = extend(points[i],{});
                }
            }
            console.log('generated '+arrayOfTriplegs.length+' triplegs for user '+ userId);
            generateTriplegSql(arrayOfTriplegs);
        };

    });
}

/**
 * Generates the sql code to insert all the newly inferred triplegs into the database
 * @param arrayOfTriplegs
 */
function generateTriplegSql(arrayOfTriplegs) {

    var triplegs = arrayOfTriplegs;

    var sql ="INSERT INTO apiv2.triplegs_inf(trip_id, user_id, from_time, to_time, type_of_tripleg)";
    var values = [];
    var user_id = 0;

    for (var i=0; i<triplegs.length;i++){
        user_id = triplegs[i].user_id;
        var object =[];
        object.push("'"+triplegs[i].trip_id+"'","'"+triplegs[i].user_id+"'","'"+triplegs[i].from_time+"'","'"+triplegs[i].to_time+"'","'"+triplegs[i].type_of_tripleg+"'");
        values.push("("+object.toString()+")");
    }

    console.log('executing triplegs -> ' + sql+ "values "+values.toString());

    if (triplegs.length>0) {
        pool.query(sql + "values " + values.toString(), function(err, result){

            if (err){
            console.log('error with sql function '+sql+" values "+values.toString());
            console.log(err);
            }
            else
            console.log('generated triplegs for ' + user_id);
        });
    }
}

/**
 * Accuracy filter
 * @param location
 * @returns {boolean}
 */
function allConditionsAreMet(location) {
    return (location.accuracy_ <= 50)
}

/**
 * Checks if the location is a candidate for a stop period
 * @param startLocation
 * @param endLocation
 * @param centroidLat
 * @param centroidLon
 * @param divisionNumber
 * @returns {boolean}
 */
function conditionIsMet(startLocation, endLocation, centroidLat, centroidLon, divisionNumber) {

    var distanceIsOk = true;

    if (centroidLat!=0 && centroidLon!=0){
        if (Math.min(calcCrow(endLocation.lat_, endLocation.lon_, centroidLat/divisionNumber, centroidLon/divisionNumber),calcCrow(startLocation.lat_, startLocation.lon_, centroidLat/divisionNumber, centroidLon/divisionNumber))<=50) distanceIsOk=false;
    }

    var distanceBtwPoints = calcCrow(startLocation.lat_, startLocation.lon_,endLocation.lat_, endLocation.lon_);
    var timeBtwPoints = (endLocation.time_ - startLocation.time_);
    var currentSpeed = distanceBtwPoints / timeBtwPoints;
    if ((distanceBtwPoints<=25) || (!distanceIsOk)) return true;
    return (currentSpeed <= thresholdSpeed);
}

/**
 * Euclidean distance between 2 latLon pairs
 * @param lat1
 * @param lon1
 * @param lat2
 * @param lon2
 * @returns {number}
 */
function calcCrow(lat1, lon1, lat2, lon2)
{
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d*1000;
}

// Converts numeric degrees to radians
function toRad(Value)
{
    return Value * Math.PI / 180;
}

/**
 * Generates the SQL statement for inserting the newly inferred trips into the database
 * @param trips
 * @param userId
 */
function generateSql(trips,userId) {
    var sql ="INSERT INTO apiv2.trips_inf(user_id, from_time, to_time, type_of_trip)";
    var values = [];

    for (var i=0; i<trips.length;i++){
        var object =[];
        object.push("'"+trips[i].user_id+"'","'"+trips[i].from_time+"'","'"+trips[i].to_time+"'","'"+trips[i].type_of_trip+"'");
        values.push("("+object.toString()+")");
    }

    console.log('executing -> ' + sql+ " values "+values.toString());
    if (trips.length>0) {
        pool.query(sql + " values " + values.toString(), function (err, result){

        if(err) {
            console.log('error with sql function '+sql+" values "+values.toString());
            console.log(err);
        }
        else
            generateTriplegs(userId);
        });
    }
}

module.exports.pool = pool;