/**
 * Created by adi on 2016-09-16.
 */

var express = require('express');
var reqClient = require('../users');
var apiClient = reqClient.client;
var router = express.Router();

router.post("/getTriplegsOfTrip", function(req,res){
    var results = [];
    var trip_id = req.body.trip_id;
    var sqlQuery = "select * from apiv2.pagination_get_triplegs_of_trip("+trip_id+")";

    var logQuery = apiClient.query(sqlQuery);

    logQuery.on('end', function(row){
        results.push(row);
        return res.json(results[0]);
    })
});

module.exports = router;