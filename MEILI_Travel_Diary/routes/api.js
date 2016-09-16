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

var express = require('express');
var router = express.Router();
var pg = require('pg');
var reqClient = require('./users');
var credentials = require('./database');
var apiClient = reqClient.client;

//NOTE - probably the manual logs can be replaced with database logs, but that should be thoroughly checked for

/**
 * Converts string to json
 * @param str
 * @returns {*}
 */
function getJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return str;
    }
    return JSON.parse(str);
}

/**
 * Inserts a personal POI as declared by the user in the UI
 */
router.post('/insertPersonalPOI', function(req, res){
    var results = [];
    var name_ins = req.body.name_ins;
    var type_ins = req.body.type_ins;
    var lat_ins = req.body.lat_ins;
    var lon_ins = req.body.lon_ins ;
    var user_id = req.body.user_id;

    var sqlQuery = "select * from ap_insert_personal_poi('"+type_ins+"','"+ name_ins.replace('\'','\'\'')+"',"+ lat_ins+","+ lon_ins +","+user_id+");";
         var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function (){
            var prioryQuery = apiClient .query(sqlQuery);
            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                    logQuery2.on('end', function(){});

                return res.json(results[0]);
            });
        });
});

/**
 * Updates the attributes of a personal POI, as specified in the UI
 */
router.post('/updatePersonalPOI', function(req, res){
    var results = [];
    var osm_id = req.body.osm_id;
    var name_updated = req.body.name_update;
    var type_updated = req.body.type_update;
    var lat_updated = req.body.lat_update;
    var lon_updated= req.body.lon_update;
    var user_id = req.body.user_id;
    var sqlQuery = "select * from ap_update_personal_poi("+osm_id+",'"+type_updated+"','"+ name_updated.replace('\'','\'\'')+"',"+ lat_updated+","+ lon_updated+");";
    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function(){
        var prioryQuery = apiClient.query(sqlQuery);
        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
            return res.json(results[0]);
        });
    });
});

/**
 * Inserts a transportation POI as specified in the UI. These POIs are available for everyone to edit
 */
router.post('/insertTransportationPOI', function(req, res){
    var results = [];
    var name_ins = req.body.name_ins;
    var type_ins = req.body.type_ins;
    var lat_ins = req.body.lat_ins;
    var lon_ins = req.body.lon_ins ;
    var transportation_lines_ins = req.body.transportation_lines;
    var transport_types_ins = req.body.transport_types;
    var user_id = req.body.user_id;

    var sqlQuery = "select * from ap_insert_transportation_poi('"+type_ins+"','"+ name_ins.replace('\'','\'\'')+"',"+ lat_ins +"," + lon_ins +",'"+ transportation_lines_ins+"','"+ transport_types_ins+"',"+user_id+")";
    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function(){
        var prioryQuery = apiClient .query(sqlQuery);
        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
            return res.json(results[0]);
        });
    });
});

/**
 * Updates a transportation POI that has been added by any user. The user-added Transportation POIs are editable by any user.
 */
router.post('/updateTransportationPOI', function(req, res){
    var results = [];

    var id_ins = req.body.id_ins;
    var name_ins = req.body.name_ins;
    var type_ins = req.body.type_ins;
    var lat_ins = req.body.lat_ins;
    var lon_ins = req.body.lon_ins ;
    var transportation_lines_ins = req.body.transportation_lines;
    var transport_types_ins = req.body.transport_types;

    var user_id = req.body.user_id;
        //TODO should probably replace the manual escapes \' with $$ - see Postgres docs
        var sqlQuery = "select * from ap_update_transportation_poi('"+id_ins+"','"+ type_ins+"','"+ name_ins.replace('\'','\'\'')+"',"+ lat_ins +"," + lon_ins +",'"+ transportation_lines_ins+"','"+ transport_types_ins+"')";
        var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);

            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                    logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Insert a point that was added by a user via the UI to a trip / tripleg to enrich its geometry
 */
router.post('/insertArtificialPoint', function(req, res){
    var results = [];
    var lat_ins = req.body.latitude;
    var lon_ins = req.body.longitude;
    var userId= req.body.userId;
    var time = req.body.time;
    var from_id = req.body.from_id;
    var to_id = req.body.to_id;

        var sqlQuery = "select * from ap_insert_artificial_user_point("+lat_ins+","+ lon_ins+",'"+ userId +"',"+ time+","+from_id+","+to_id+")";
        var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);
            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
             });
        });
});

/**
 * Update an artifically inserted point (see above for definition)
 */
router.post('/updateArtificialPoint', function(req, res){
    var results = [];

    var id = req.body.id;
    var lat_ins = req.body.latitude;
    var lon_ins = req.body.longitude;
    var user_id = req.body.user_id;

    var sqlQuery = "select * from ap_update_artificial_user_point("+id+","+lat_ins+","+ lon_ins+")";
    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);

            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$ Finished"+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Deletes an artificial point (see above for description)
 */
router.post('/deleteArtificialPoint', function(req, res){
    var results = [];
    var id = req.body.id;
    var user_id = req.body.user_id;
    var sqlQuery = "select * from ap_delete_artificial_user_point('"+id+"')";
    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);
            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Inserts a tripleg annotated by the user via the UI to the database
 */
router.post('/insertNewTripleg', function(req, res){
    var results = [];
    var tripleg_id = req.body.tripleg_id;
    var trip_id = req.body.trip_id;
    var user_id = req.body.user_id;
     var from_point_id = req.body.from_point_id;
    var to_point_id = req.body.to_point_id;
    var from_time =  req.body.from_time;
    var to_time =  req.body.to_time ;
    var type_of_tripleg = req.body.type_of_tripleg;
    var transportation_type = req.body.transportation_type;
    if (transportation_type==undefined) transportation_type=1;
    var transportation_poi_id = req.body.transportation_poi_id;
    var length_of_tripleg = req.body.length_of_tripleg;
    var duration_of_tripleg = req.body.duration_of_tripleg;

        var sqlQuery = "select * from ap_insert_tripleg_gt('"+tripleg_id+"','"+trip_id+"',"+user_id+"::bigint,'"+from_point_id+"','"+to_point_id+"','"+from_time+"'::bigint,'"+to_time+"'::bigint,"+
            type_of_tripleg+"::smallint,"+transportation_type+","+transportation_poi_id+"::bigint,"+length_of_tripleg+","+duration_of_tripleg+")";
        var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");
        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery, function(err, result) {
            });

            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Gets a list of purposes from the database
 */
router.post('/getPurpose', function(req, res){
    var results = [];

    var userId = req.body.userId;
    var sqlQuery = "select * from ap_get_purposes()";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function(){
        var prioryQuery = apiClient.query(sqlQuery, function(err, result) {
        });

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function(){
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end', function(){});
            return res.json(results);
        });
    })
});

/**
 * Updates an existing annotated tripleg
 */
router.post('/updateExistingTripleg', function(req, res){
    var results = [];
    var tripleg_id = req.body.tripleg_id;
    var trip_id = req.body.trip_id;
    var user_id = req.body.user_id;
    var from_point_id = req.body.from_point_id;
    var to_point_id = req.body.to_point_id;
    var from_time = req.body.from_time;
    var to_time =  req.body.to_time ;
    var type_of_tripleg = req.body.type_of_tripleg;
    var transportation_type = req.body.transportation_type;
    if (transportation_type==undefined) transportation_type = 0;
    var transportation_poi_id = req.body.transportation_poi_id;
    var length_of_tripleg = req.body.length_of_tripleg;
    var duration_of_tripleg = req.body.duration_of_tripleg;

        var sqlQuery = "select * from ap_update_tripleg_gt('"+tripleg_id+"','"+trip_id+"',"+user_id+"::bigint,'"+from_point_id+"','"+to_point_id+"','"+from_time+"'::bigint,'"+to_time+"'::bigint,"+
            type_of_tripleg+"::smallint,"+transportation_type+","+transportation_poi_id+"::bigint"+","+length_of_tripleg+","+duration_of_tripleg+")";

        var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);
            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                    logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        })
});

/**
 * Deletes an annotated tripleg
 */
router.post('/deleteTripleg', function(req, res){
    var results = [];
    var tripleg_id = req.body.tripleg_id;
    var user_id = req.body.user_id;

        var sqlQuery = "select * from ap_delete_tripleg_gt('"+tripleg_id+"')";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);
            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Inserts a trip that was annotated by the user via the UI
 */
router.post('/insertNewTrip', function(req, res){
    var results = [];
    var trip_id = req.body.trip_id;
    var user_id = req.body.user_id;
    var from_point_id = req.body.from_point_id;
    var to_point_id = req.body.to_point_id;
    var from_time = req.body.from_time;
    var to_time = req.body.to_time;
    var type_of_trip = req.body.type_of_trip;
    var purpose_id = req.body.purpose_id;
    var destination_poi_id = req.body.destination_poi_id;
    var length_of_trip = req.body.length_of_trip;
    var duration_of_trip = req.body.duration_of_trip;
    var number_of_triplegs = req.body.number_of_triplegs;

        var sqlQuery = "select * from ap_insert_trip_gt('"+trip_id+"',"+user_id+"::bigint,'"+from_point_id+"','"+to_point_id+"','"+from_time+"'::bigint,'"+to_time+"'::bigint,"+
            type_of_trip+"::smallint,"+purpose_id+","+destination_poi_id+"::bigint,"+length_of_trip+"::double precision,"+duration_of_trip+"::double precision,"+number_of_triplegs+")";

        var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);

            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Updates an annotated trip
 */
router.post('/updateExistingTrip', function(req, res){
    var results = [];
    var trip_id = req.body.trip_id;
    var user_id = req.body.user_id;
    var from_point_id = req.body.from_point_id;
    var to_point_id = req.body.to_point_id;
    var from_time = req.body.from_time;
    var to_time = req.body.to_time;
    var type_of_trip = req.body.type_of_trip;
    var purpose_id = req.body.purpose_id;
    var destination_poi_id = req.body.destination_poi_id;
    var length_of_trip = req.body.length_of_trip;
    var duration_of_trip = req.body.duration_of_trip;
    var number_of_triplegs = req.body.number_of_triplegs;

    var poiId = -1;

    if (destination_poi_id!=undefined) poiId = destination_poi_id;

    var sqlQuery = "select * from ap_update_trip_gt('"+trip_id+"',"+user_id+"::bigint,'"+from_point_id+"','"+to_point_id+"','"+from_time+"'::bigint,'"+to_time+"'::bigint,"+
            type_of_trip+"::smallint,"+purpose_id+","+poiId+","+length_of_trip+","+duration_of_trip+","+number_of_triplegs+")";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

        logQuery.on('end', function(){
            var prioryQuery = apiClient.query(sqlQuery);

            prioryQuery.on('row', function (row) {
                results.push(row);
            });

            prioryQuery.on('end', function(){
                var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
                logQuery2.on('end', function(){});
                return res.json(results[0]);
            });
        });
});

/**
 * Deletes an annotated trip
 */
router.post('/deleteTrip', function(req, res){
    var results = [];
    var trip_id = req.body.trip_id;
    var user_id = req.body.user_id;

    var sqlQuery = "select * from ap_delete_trip_gt('"+trip_id+"')";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','');");

    logQuery.on('end', function() {
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function () {
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end', function(){});
            return res.json(results[0]);
        });
    });
});

/**
 * Pagination function to get the next unannotated trips of a set of trips
 */
router.post('/getNextTrip', function(req, res){
    var results = [];
    var userId = req.body.userId;
    var toTime=  req.body.toTime;
    var sqlQuery ="select * from ap_get_next_trip(" + userId + ",'" + toTime + "'::bigint)";
    var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function() {
        var prioryQuery = apiClient.query(sqlQuery);
        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function () {
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end',function(){});
            return res.json(results[0]);
        });
    });
});

/**
 * Gets the points of interest within a central area of a location (trip end)
 */
router.post('/getPOIBuff', function(req,res){
    var results = [];
    var lat_ = req.body.lat;
    var lon_ = req.body.lon;
    var userId = req.body.userId;

    var sqlQuery = "select * from ap_get_destinations_close_by(" + lat_ + "," + lon_ + "," + userId + ")";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function() {
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function () {
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end', function(){});
            return res.json(results[0]);
        });
    })
});

/**
 * Insert front end log describes the interaction of the user with the UI
 */
router.post('/insertFrontEndLog', function(req,res) {

    var user_id = req.body.user_id;
    var operation = req.body.operation;
    var exception_stack='';
    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",'"+operation+"','frontend','"+exception_stack+"')");
    logQuery.on('end', function(){return res.json('ok');});
});

/**
 * Insert log associated with an error encountered by the user while interacting with the UI
 */
router.post('/insertExceptionLog', function(req,res) {
    var user_id = req.body.user_id;
    var operation = req.body.operation;
    var exception_stack = req.body.stack;

    var logQuery = apiClient.query("select * from ap_insert_web_log("+user_id+","+ new Date().getTime()+",$$"+operation+"$$,'ERROR',$$"+exception_stack+"$$)");
    logQuery.on('end', function(){return res.json('ok');});
});

/**
 * Get all the transportation POIs within an area surrounding a location
 */
router.post('/getTransportationPOIBuff', function(req,res){
    var results = [];

    var lat_ = req.body.lat;
    var lon_ = req.body.lon;
    var userId = req.body.user_id;

    var sqlQuery = "select * from ap_get_transit_pois_within_buffer(" + lat_ + "," + lon_ + ",500, -1000)";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function() {
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function () {
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end', function(){});
            return res.json(results[0]);

        });
    });
});

/**
 * Get the statistics describing how a user has been traveling for the stats webpage
 */
router.post('/getUserStats', function(req,res){
    var results = [];
    var userId = req.body.user_id;

    var sqlQuery = "select * from ap_get_user_stats("+userId+")";

    var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function() {
        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function () {
            if (results.length == 0) results[0]='empty';
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end', function(){});
            return res.json(results[0]);
        });
    });
});

/**
 * Pagination function for getting a previous annotated trpi
 */
router.post('/getPrevTrip', function(req, res){
    var results = [];
    var userId = req.body.userId;
    var fromTime = req.body.fromTime;

    var sqlQuery = "select * from ap_get_prev_trip(" + userId + ",'" + fromTime + "'::bigint)";
    var logQuery = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+",$$"+sqlQuery+"$$,'backend','')");

    logQuery.on('end', function() {
        var prioryQuery = apiClient.query("select * from ap_get_prev_trip(" + userId + ",'" + fromTime + "'::bigint)");

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function () {
            var logQuery2 = apiClient.query("select * from ap_insert_web_log("+userId+","+ new Date().getTime()+"   ,$$Finished "+sqlQuery+"$$,'backend','')");
            logQuery2.on('end', function (){});
            return res.json(results[0]);
        });
    });
});

module.exports = router;