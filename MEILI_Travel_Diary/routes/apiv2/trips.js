/**
 * Created by adi on 2016-09-16.
 */

var express = require('express');
var reqClient = require('../users');
var apiClient = reqClient.client;
var router = express.Router();
var util = require('./util');

/**
 * @api {get} /trips/getTripsForBadge&:user_id Gets the number of trips that the user has to process
 * @apiName GetTripsForBadge
 * @apiGroup Trips
 *
 * @apiError [400] UserIdInvalid The <code>user_id</code> is undefined or null.
 *
 * @apiParam {Number} user_id Id of the user that requests the number of available unannotated trips.
 *
 * @apiSuccess {Number} user_get_badge_trips_info Number of unannotated trips available to the user.
 */
router.get("/getTripsForBadge", function(req,res){
    var results = [];
    var user_id = req.query.user_id;

    if (!user_id) {
        return util.handleError(res, 400, "Invalid user id");
    }
    else {
        var sqlQuery = "select * from apiv2.user_get_badge_trips_info("+user_id+")";
        var logQuery = apiClient.query(sqlQuery);

        logQuery.on('error', function(row){
          return util.handleError(res, 500, row.message);
        });

        logQuery.on('end', function(row){
            results.push(row);
            return res.json(results[0]);
        });
    }
});


/**
 * @api {get} /trips/getLastTripOfUser&:user_id Gets the earliest unannotated trip of the user
 * @apiName GetLastTripOfUser
 * @apiGroup Trips
 *
 * @apiError [400] UserIdInvalid The <code>user_id</code> is undefined or null.
 * @apiError [500] UserCannotAnnotate The user with <code>user_id</code> does not have any trips to annotate.
 *
 * @apiParam {Number} user_id Id of the user that requests the earliest unannotated trip
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs
 */
router.get("/getLastTripOfUser", function(req,res){
    var results = {};
    var user_id = req.query.user_id;

    if (!user_id) {
        return util.handleError(res, 400, "Invalid user id");
    }
    else
    {
        // TODO - this is a hack, not a solution
        //var sqlQuery = "select * from apiv2.pagination_get_next_process("+user_id+")";
        var sqlQuery = "select * from apiv2.get_next_trip_response_temp_fix("+user_id+")";
        var logQuery = apiClient.query(sqlQuery);

        logQuery.on('row', function(row){
            results = row;
        });

        logQuery.on('error', function (row){
           return util.handleError(res, 500, row.message);
        });

        logQuery.on('end', function(){
            // check if it is empty
            if (!(Object.keys(results).length === 0 && results.constructor === Object))
            {
                return res.json(results);
            }
            else {
                return util.handleError(res, 204, "The user does not have any trips to process");
            }
        })
    }
});

/**
 * @api {get} /trips/updateStartTimeOfTrip&:trip_id&:start_time Updates the start time of a trip
 * @apiName UpdateStartTimeOfTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameters <code>trip_id</code> or <code>start_time</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will have its start date modified.
 * @apiParam {Number} start_time The new value for the start time of the specified trip
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after update
 */
router.get("/updateStartTimeOfTrip", function(req,res){
    var results = {};
    results.triplegs = [];
    var trip_id = req.query.trip_id;
    var new_start_time = req.query.start_time;

    if ((!trip_id)|| (!new_start_time)) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.update_trip_start_time($bd$"+new_start_time+"$bd$, $bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.triplegs = row.update_trip_start_time;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/updateEndTimeOfTrip&:trip_id&:end_time Updates the end time of a trip
 * @apiName UpdateEndTimeOfTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameters <code>trip_id</code> or <code>end_time</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will have its end time modified.
 * @apiParam {Number} end_time The new value for the end time of the specified trip
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after update
 */
router.get("/updateEndTimeOfTrip", function(req,res){
    var results = {};
    results.triplegs = [];
    var trip_id = req.query.trip_id;
    var new_end_time = req.query.end_time;

    if ((!trip_id)|| (!new_end_time)) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.update_trip_end_time($bd$"+new_end_time+"$bd$,$bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.triplegs = row.update_trip_end_time;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/mergeWithNextTrip&:trip_id Merges a trip with its neighbor
 * @apiName MergeWithNextTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameters <code>trip_id</code> is undefined, null or of a wrong type.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will be merged with its neighbor
 *
 * @apiSuccess {Tripleg[]} Triplegs An array of json objects that represent the triplegs of the trip after the merge is performed
 */
router.get("/mergeWithNextTrip", function(req,res){
    var results = {};
    results.triplegs = [];
    var trip_id = req.query.trip_id;

    if (!trip_id) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.merge_with_next_trip($bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.triplegs = row.merge_with_next_trip;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/insertPeriodBetweenTrips&:start_time&:end_time&:user_id Inserts a missed non movement period between two trips by splitting the existing affected trip
 * @apiName InsertPeriodBetweenTris
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameters <code>user_id</code>, <code>start_time</code> or <code>end_time</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} user_id Id of the user who inserts the period between trips
 * @apiParam {Number} start_time Time at which the non movement period started
 * @apiParam {Number} end_time Time at which the non movement period ended
 *
 * @apiSuccess {Trip} Trip Gets the json representation of the next trip to process for the user that performed the action.
 */
router.get("/insertPeriodBetweenTrips", function(req,res){
    var results = {};
    results.trip = [];
    var user_id = req.query.user_id;
    var start_time = req.query.start_time;
    var end_time = req.query.end_time;

    if ((!user_id) || (!start_time) || (!end_time)) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.insert_stationary_trip_for_user($bd$"+ start_time +"$bd$,$bd$"+ end_time +"$bd$,$bd$"+ user_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            console.log(row);
                results.trip = row;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/updatePurposeOfTrip&:trip_id&:purpose_id Updates the purpose of a trip
 * @apiName UpdatePurposeOfTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameters <code>trip_id</code> or <code>purpose_id</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will have its purpose updated
 * @apiParam {Number} purpose_id The new value for the purpose_id
 *
 * @apiSuccess {Boolean} Boolean The success state of the operation.
 */
router.get("/updatePurposeOfTrip", function(req,res){
    var results = {};
    results.status = {};
    var trip_id = req.query.trip_id;
    var purpose_id = req.query.purpose_id;

    if ((!trip_id) || (!purpose_id )) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.update_trip_purpose($bd$"+purpose_id+"$bd$, $bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.status = row.update_trip_purpose;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/updateDestinationPoiIdOfTrip&:trip_id&:destination_poi_id Updates the destination poi id of a trip
 * @apiName UpdateDestinationPoiIdOfTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameters <code>trip_id</code> or <code>destination_poi_id</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will have its destination poi id updated
 * @apiParam {Number} destination_poi_id The new value for the destination_poi_id
 *
 * @apiSuccess {Boolean} Boolean The success state of the operation.
 */
router.get("/updateDestinationPoiIdOfTrip", function(req,res){
    var results = {};
    results.status = {};
    var trip_id = req.query.trip_id;
    var destination_poi_id = req.query.destination_poi_id;

    if ((!trip_id)|| (!destination_poi_id)) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.update_trip_destination_poi_id($bd$"+destination_poi_id+"$bd$, $bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.status = row.update_trip_destination_poi_id;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/deleteTrip&:trip_id Deletes a trip
 * @apiName DeleteTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameter <code>trip_id</code> is undefined, null or of a wrong type.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip that will be deleted
 *
 * @apiSuccess {Trip} Trip Gets the json representation of the next trip to process for the user that performed the action.
 */
router.get("/deleteTrip", function(req,res){
    var results = {};
    var trip_id = req.query.trip_id;

    if (!trip_id ) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.delete_trip($bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results = row;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/confirmAnnotationOfTrip&:trip_id& Confirms the annotations of a trip, which moves the user to the next unannotated trip
 * @apiName ConfirmAnnotationOfTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameter <code>trip_id</code> is undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip whose annotations are confirmed
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs
 */
router.get("/confirmAnnotationOfTrip", function(req,res){
    var results = {};
    var trip_id = req.query.trip_id;

    if (!trip_id) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.confirm_annotation_of_trip_get_next($bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results = row;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/navigateToNextTrip&:trip_id&:user_id Navigates to the next annotated trip, if it exists
 * @apiName NavigateToNextTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameter <code>trip_id</code> or <code>user_id</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip whose proceeding neighbor is retrieved
 * @apiParam {Number} user_id Id of the user that annotates the trip
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs, and a status field with values "already_annotated", if the trip's time intervals should not be modifiable, or "needs_annotation" if the trip is the same with the response for getLastTripOfUser
 */
router.get("/navigateToNextTrip", function(req,res){
    var results = {};
    var trip_id = req.query.trip_id;
    var user_id = req.query.user_id;

    if ((!trip_id )|| (!user_id )) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.pagination_navigate_to_next_trip($bd$"+user_id+"$bd$,$bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results = row;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

/**
 * @api {get} /trips/navigateToPreviousTrip&:trip_id&:user_id Navigates to the previous annotated trip, if it exists
 * @apiName NavigateToPreviousTrip
 * @apiGroup Trips
 *
 * @apiError [400] InvalidInput The parameter <code>trip_id</code> or <code>user_id</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {Number} trip_id Id of the trip whose preceeding neighbor is retrieved
 * @apiParam {Number} user_id Id of the user that annotates the trip
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs (empty when the preceeding trip does not exist), and a status field with values "already_annotated", if the trip's time intervals should not be modifiable, or "INVALID" if the navigation works unexpected
 */
router.get("/navigateToPreviousTrip", function(req,res){
    var results = {};
    var trip_id = req.query.trip_id;
    var user_id = req.query.user_id;

    if ((!trip_id)|| (!user_id )) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.pagination_navigate_to_previous_trip($bd$"+user_id+"$bd$,$bd$"+trip_id+"$bd$)";
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results = row;
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message+' '+sqlQuery);
        });

        prioryQuery.on('end', function () {
            return res.json(results);
        });
    }
});

module.exports = router;