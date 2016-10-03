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
 * @apiError [500] TripIdInvalid The <code>trip_id</code> is undefined or null.
 * @apiError [500] TripIdNotFound The <code>trip_id</code> does not exist.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip for which the triplegs will be retrieved
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs
 */
router.get("/getTriplegsOfTrip", function(req,res){
    var results = [];
    var trip_id = req.query.trip_id;

    if (trip_id == null || trip_id == undefined) {
        res.status(500);
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

        prioryQuery.on('error', function (row) {
            res.status(500);
            res.send(row);
        });

        prioryQuery.on('end', function () {
            if (results.length>0)
            return res.json(results[0]);
            else {
                res.status(500);
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
 * @apiError [500] SQLError SQL error traceback.
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
            res.send(row);
            // res.send("Request failed with parameters tripleg_id: "+ tripleg_id+" and start_time "+new_start_time);
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
 * @apiError [500] SQLError SQL error traceback.
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
            res.send(row);
            // res.send("Request failed with parameters tripleg_id: "+ tripleg_id+" and start_time "+new_end_time);
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
 * @apiError [500] SQLError SQL error traceback.
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
        var sqlQuery = "select * from apiv2.delete_tripleg("+tripleg_id+")";
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

/**
 * @api {get} /triplegs/insertTransitionBetweenTriplegs&:start_time&:end_time&:from_travel_mode&:to_travel_mode&:trip_id Inserts a missed transition between two triplegs by splitting the existing affected tripleg
 * @apiName InsertTransitionBetweenTriplegs
 * @apiGroup Triplegs
 *
 * @apiError [500] InvalidInput The parameters <code>tripleg_id</code> is undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip where the transition will be inserted
 * @apiParam {Number} start_time Time at which the transition started
 * @apiParam {Number} end_time Time at which the transition ended
 * @apiParam {Number} from_travel_mode The travel mode from which the user changed
 * @apiParam {Number} to_travel_mode The travel mode to which the user changed
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after the insertion of the transition tripleg
 */
router.get("/insertTransitionBetweenTriplegs", function(req,res){
    var results = [];
    var trip_id = req.query.trip_id;
    var start_time = req.query.start_time;
    var end_time = req.query.end_time;
    var from_travel_mode = req.query.from_travel_mode;
    var to_travel_mode =req.query.to_travel_mode;

    if (trip_id == null || trip_id == undefined || trip_id == null || trip_id == undefined ||
        start_time== null || start_time== undefined || end_time== null || end_time== undefined ||
        from_travel_mode == null || from_travel_mode == undefined || to_travel_mode == null || to_travel_mode== undefined) {
        res.status(500);
        res.send("Invalid input parameters");
        return res;
    }

    else
    {
        var sqlQuery = "select * from apiv2.insert_stationary_tripleg_period_in_trip($bd$"+ start_time +"$bd$,$bd$"+ end_time +"$bd$,$bd$"+ from_travel_mode +
        "$bd$,$bd$"+to_travel_mode +"$bd$,$bd$"+trip_id +"$bd)";
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

module.exports = router;