/**
 * Created by adi on 2016-10-03.
 */

var express = require('express');
var reqClient = require('../users');
var apiClient = reqClient.client;
var router = express.Router();
var util = require('./util');

/**
 * @api {get} /pois/insertTransportationPoi&:name_&:latitude&:longitude&:declaring_user_id&:transportation_lines&:transportation_types Inserts a new transportation POI declared by a user
 * @apiName InsertTransportationPoi
 * @apiGroup POIs
 *
 * @apiError [400] InvalidInput The parameters <code>name_</code>, <code>latitude</code>, <code>longitude</code>, <code>declaring_user_id</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {String} name_ Name of the inserted POI
 * @apiParam {Number} latitude Latitude of the inserted POI
 * @apiParam {Number} longitude Longitude of the inserted POI
 * @apiParam {Number} declaring_user_id Id of the user that inserts the POI
 * @apiParam {Number} transportation_lines(optional) The text representation of transport lines entered by the user
 * @apiParam {Number} transportation_types(optional) The types of travel modes that are accessible to the station
 *
 * @apiSuccess {Id} The id of the inserted transportation POI.
 */
router.get("/insertTransportationPoi", function(req,res){
    var results = [];
    var name_ = req.query.name_;
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var declaring_user_id = req.query.declaring_user_id;
    var transportation_lines = (req.query.transportation_lines == undefined) ? "" : req.query.transportation_lines;
    var transportation_types = (req.query.transportation_types == undefined) ? "" : req.query.transportation_types;

    if ((!name_ )|| (!latitude) || (!longitude) || (!declaring_user_id)) {
        return util.handleError(res, 400, "Invalid input parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.insert_transition_poi($bd$"+name_+"$bd$,$bd$"+ latitude+"$bd$,$bd$"+longitude+"$bd$,$bd$"
            +declaring_user_id+"$bd$,$bd$"+ transportation_lines+"$bd$,$bd$"+transportation_types+"$bd$)";

        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});


/**
 * @api {get} /pois/insertDestinationPoi&:name_&:latitude&:longitude&:declaring_user_id Inserts a new destination POI declared by a user
 * @apiName InsertDestinationPoi
 * @apiGroup POIs
 *
 * @apiError [400] InvalidInput The parameters <code>name_</code>, <code>latitude</code>, <code>longitude</code>, <code>declaring_user_id</code> are undefined, null or of wrong types.
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiParam {String} name_ Name of the inserted POI
 * @apiParam {Number} latitude Latitude of the inserted POI
 * @apiParam {Number} longitude Longitude of the inserted POI
 * @apiParam {Number} declaring_user_id Id of the user that inserts the POI
 *
 * @apiSuccess {Id} The id of the inserted destination POI.
 */
router.get("/insertDestinationPoi", function(req,res){
    var results = [];
    var name_ = req.query.name_;
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var declaring_user_id = req.query.declaring_user_id;

    if ((!name_) || (!latitude) || (!longitude) || (!declaring_user_id )) {
        return util.handleError(res, 400, "Invalid parameters");
    }

    else
    {
        var sqlQuery = "select * from apiv2.insert_destination_poi($bd$"+name_+"$bd$,$bd$"+ latitude+"$bd$,$bd$"+longitude+"$bd$,$bd$"
            +declaring_user_id+"$bd$)";

        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('error', function(row){
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results[0]);
        });
    }
});

module.exports = router;