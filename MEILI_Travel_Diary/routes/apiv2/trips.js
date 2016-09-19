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
 * @apiParam {Number} user_id Id of the user that requests the number of available unannotated trips.
 *
 * @apiSuccess {Number} user_get_badge_trips_info Number of unannotated trips available to the user.
 */
router.get("/getTripsForBadge", function(req,res){
    var results = [];
    var user_id = req.query.user_id;
    var sqlQuery = "select * from apiv2.user_get_badge_trips_info("+user_id+")";

    var logQuery = apiClient.query(sqlQuery);

    logQuery.on('end', function(row){
        results.push(row);
        return res.json(results[0]);
    })
});


/**
 * @api {get} /trips/getLastTripOfUser&:user_id Gets the earliest unannotated trip of the user
 * @apiName GetLastTripOfUser
 * @apiGroup Trips
 *
 * @apiParam {Number} user_id Id of the user that requests the earliest unannotated trip
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs
 */
router.post("/getLastTripOfUser", function(req,res){
    var results = [];
    var user_id = req.body.user_id;
    var sqlQuery = "select * from apiv2.pagination_get_next_process("+user_id+")";

    var logQuery = apiClient.query(sqlQuery);

    logQuery.on('end', function(row){
        results.push(row);
        return res.json(results[0]);
    })
});

module.exports = router;