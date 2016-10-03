/**
 * Created by adi on 2016-09-16.
 */

var express = require('express');
var reqClient = require('../users');
var apiClient = reqClient.client;
var router = express.Router();

/**
 * @api {get} /trips/getTripsForBadge&:user_id Gets the number of trips that the user has to process
 * @apiName GetTripsForBadge
 * @apiGroup Trips
 *
 * @apiError [500] UserIdInvalid The <code>user_id</code> is undefined or null.
 *
 * @apiParam {Number} user_id Id of the user that requests the number of available unannotated trips.
 *
 * @apiSuccess {Number} user_get_badge_trips_info Number of unannotated trips available to the user.
 */
router.get("/getTripsForBadge", function(req,res){
    var results = [];
    var user_id = req.query.user_id;

    if (user_id == null || user_id == undefined) {
        res.status(500);
        res.send("Invalid user id");
        return res;
    }
    else {
        var sqlQuery = "select * from apiv2.user_get_badge_trips_info("+user_id+")";
        var logQuery = apiClient.query(sqlQuery);

        logQuery.on('end', function(row){
            results.push(row);
            return res.json(results[0]);
        })
    }
});


/**
 * @api {get} /trips/getLastTripOfUser&:user_id Gets the earliest unannotated trip of the user
 * @apiName GetLastTripOfUser
 * @apiGroup Trips
 *
 * @apiError [500] UserIdInvalid The <code>user_id</code> is undefined or null.
 * @apiError [500] UserCannotAnnotate The user with <code>user_id</code> does not have any trips to annotate.
 *
 * @apiParam {Number} user_id Id of the user that requests the earliest unannotated trip
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs
 */
router.get("/getLastTripOfUser", function(req,res){
    var results = [];
    var user_id = req.query.user_id;

    if (user_id == null || user_id == undefined) {
        res.status(500);
        res.send("Invalid user id");
        return res;
    }
    else
    {
        var sqlQuery = "select * from apiv2.pagination_get_next_process("+user_id+")";
        var logQuery = apiClient.query(sqlQuery);

        logQuery.on('row', function(row){
            results.push(row);
        });

        logQuery.on('end', function(){
            if (results.length>0)
                return res.json(results[0]);
            else {
                res.status(500);
                res.send("The user does not have any trips to process");
                return res
            }
        })
    }
});

/**
 * @api {get} /trips/updateStartTimeOfTrip&:trip_id&:start_time Updates the start time of a trip
 * @apiName UpdateStartTimeOfTrip
 * @apiGroup Trips
 *
 * @apiError [500] InvalidInput The parameters <code>trip_id</code> or <code>start_time</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will have its start date modified.
 * @apiParam {Number} start_time The new value for the start time of the specified trip
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after update
 */
router.get("/updateStartTimeOfTrip", function(req,res){
    var results = [];
    var trip_id = req.query.trip_id;
    var new_start_time = req.query.start_time;

    if (trip_id == null || trip_id == undefined || new_start_time == null || new_start_time == undefined) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.update_trip_start_time("+trip_id+",$bd$"+new_start_time+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_triplegs_of_trip!=null)
                results.push(row);
        });

        prioryQuery.on('error', function(row){
            res.status(500);
            res.send(row);
            // res.send("Request failed with parameters trip_id: "+ trip_id+" and start_time "+new_start_time);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});

/**
 * @api {get} /trips/updateEndTimeOfTrip&:trip_id&:end_time Updates the end time of a trip
 * @apiName UpdateEndTimeOfTrip
 * @apiGroup Trips
 *
 * @apiError [500] InvalidInput The parameters <code>trip_id</code> or <code>end_time</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will have its end time modified.
 * @apiParam {Number} end_time The new value for the end time of the specified trip
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after update
 */
router.get("/updateEndTimeOfTrip", function(req,res){
    var results = [];
    var trip_id = req.query.trip_id;
    var new_end_time = req.query.end_time;

    if (trip_id == null || trip_id == undefined || new_end_time == null || new_end_time == undefined) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.update_trip_end_time("+trip_id+",$bd$"+new_end_time+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_triplegs_of_trip!=null)
                results.push(row);
        });

        prioryQuery.on('error', function(row){
            res.status(500);
            res.send(row);
            // res.send("Request failed with parameters trip_id: "+ trip_id+" and start_time "+new_start_time);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});

/**
 * @api {get} /trips/deleteTrip&:trip_id Deletes a trip
 * @apiName DeleteTrip
 * @apiGroup Trips
 *
 * @apiError [500] InvalidInput The parameter <code>trip_id</code> is undefined, null or of a wrong type.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will be deleted
 *
 * @apiSuccess {Trip} Gets the json representation of the next trip to process for the user that performed the action.
 */
router.get("/deleteTrip", function(req,res){
    var results = [];
    var trip_id = req.query.trip_id;

    if (trip_id == null || trip_id == undefined ) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.delete_trip($bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_next_process!=null)
                results.push(row);
        });

        prioryQuery.on('error', function(row){
            res.status(500);
            res.send(row);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});

// TODO - insert trip


// TODO - specify purpose of trip


// TODO - specify destination POI of trip

module.exports = router;