/**
 * Created by adi on 2016-09-16.
 */

var express = require('express');
var reqClient = require('../users');
var apiClient = reqClient.client;
var router = express.Router();


/**
 * @api {get} /triplegs/getTriplegsOfTrip&:trip_id Gets the triplegs of a given trip
 * @apiName GetTriplegsOfTrip
 * @apiGroup Triplegs
 *
 * @apiError [404] TripIdInvalid The <code>trip_id</code> is undefined or null.
 * @apiError [406] TripIdNotFound The <code>trip_id</code> does not exist.
 *
 * @apiParam {Number} trip_id Id of the trip for which the triplegs will be retrieved
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs
 */
router.get("/getTriplegsOfTrip", function(req,res){
    var results = [];
    var trip_id = req.query.trip_id;

    if (trip_id == null || trip_id == undefined) {
        res.status(404);
        res.send("Invalid trip id");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.pagination_get_triplegs_of_trip("+trip_id+")";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_triplegs_of_trip!=null)
                results.push(row);
        });

        prioryQuery.on('end', function () {
            if (results.length>0)
            return res.json(results[0]);
            else {
                res.status(406);
                res.send("Trip id does not exist");
                return res
            }
        });
    }
});

/**
 * @api {get} /triplegs/updateStartTimeOfTripleg&:tripleg_id&:start_time Updates the start time of a tripleg
 * @apiName UpdateStartTimeOfTripleg
 * @apiGroup Triplegs
 *
 * @apiError [500] InvalidInput The parameters <code>tripleg_id</code> or <code>start_time</code> are undefined, null or of wrong types.
 *
 * @apiParam {Number} tripleg_id Id of the tripleg that will have its start date modified.
 * @apiParam {Number} start_time The new value for the start time of the specified tripleg
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after update
 */
router.get("/updateStartTimeOfTripleg", function(req,res){
    var results = [];
    var tripleg_id = req.query.tripleg_id;
    var new_start_time = req.query.start_time;

    if (tripleg_id == null || tripleg_id == undefined || new_start_time == null || new_start_time == undefined) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.tripleg_update_start_time("+tripleg_id+",$bd$"+new_start_time+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_triplegs_of_trip!=null)
                results.push(row);
        });

        prioryQuery.on('error', function(row){
            res.status(500);
            res.send("Request failed with parameters tripleg_id: "+ tripleg_id+" and start_time "+new_start_time);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});


/**
 * @api {get} /triplegs/updateEndTimeOfTripleg&:tripleg_id&:end_time Updates the end time of a tripleg
 * @apiName UpdateEndTimeOfTripleg
 * @apiGroup Triplegs
 *
 * @apiError [500] InvalidInput The parameters <code>tripleg_id</code> or <code>end_time</code> are undefined, null or of wrong types.
 * @apiError [500] QueryFailed The query could not be run with the given parameter <code>tripleg_id</code> and <code>end_time</code>.
 *
 * @apiParam {Number} tripleg_id Id of the tripleg that will have its end date modified.
 * @apiParam {Number} end_time The new value for the end time of the specified tripleg
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after update
 */
router.get("/updateEndTimeOfTripleg", function(req,res){
    var results = [];
    var tripleg_id = req.query.tripleg_id;
    var new_end_time = req.query.end_time;

    if (tripleg_id == null || tripleg_id == undefined || new_end_time == null || new_end_time == undefined) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.tripleg_update_end_time("+tripleg_id+",$bd$"+new_end_time+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_triplegs_of_trip!=null)
                results.push(row);
        });

        prioryQuery.on('error', function(row){
            res.status(500);
            res.send("Request failed with parameters tripleg_id: "+ tripleg_id+" and start_time "+new_end_time);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});

/**
 * @api {get} /triplegs/deleteTripleg&:tripleg_id Deletes the tripleg specified by id
 * @apiName DeleteTripleg
 * @apiGroup Triplegs
 *
 * @apiError [500] OnlyTriplegIn Trip The only tripleg of a trip cannot be deleted. If you want to delete the tripleg, call the trip deletion endpoint
 * @apiError [500] InvalidInput The parameters <code>tripleg_id</code> is undefined, null or of wrong types.
 * @apiError [500] SQL error status from the db, if in debug mode.
 *
 * @apiParam {Number} tripleg_id Id of the tripleg that will be deleted
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after deletion
 */
router.get("/deleteTripleg", function(req,res){
    var results = [];
    var tripleg_id = req.query.tripleg_id;

    if (tripleg_id == null || tripleg_id == undefined) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.apiv2.delete_tripleg("+tripleg_id+")";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            if (row.pagination_get_triplegs_of_trip!=null)
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

//TODO - these are bits of code that are not implemented / tested yet -> move the todo list below when a function is cleared out

module.exports = router;