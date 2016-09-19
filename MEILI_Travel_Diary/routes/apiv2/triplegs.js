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

module.exports = router;