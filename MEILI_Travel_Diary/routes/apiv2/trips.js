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
 * @apiError [404] UserIdInvalid The <code>user_id</code> is undefined or null.
 *
 * @apiParam {Number} user_id Id of the user that requests the number of available unannotated trips.
 *
 * @apiSuccess {Number} user_get_badge_trips_info Number of unannotated trips available to the user.
 */
router.get("/getTripsForBadge", function(req,res){
    var results = [];
    var user_id = req.query.user_id;

    if (user_id == null || user_id == undefined) {
        res.status(404);
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
 * @apiError [404] UserIdInvalid The <code>user_id</code> is undefined or null.
 * @apiError [406] UserCannotAnnotate The user with <code>user_id</code> does not have anny ttrips to annotate.
 *
 * @apiParam {Number} user_id Id of the user that requests the earliest unannotated trip
 *
 * @apiSuccess {Trip} Trip The json representation of a trip without its triplegs
 */
router.get("/getLastTripOfUser", function(req,res){
    var results = [];
    var user_id = req.query.user_id;

    if (user_id == null || user_id == undefined) {
        res.status(404);
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
                res.status(406);
                res.send("The user does not have any trips to process");
                return res
            }
        })
    }
});

module.exports = router;