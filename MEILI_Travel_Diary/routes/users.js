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
var passport = require('passport');
var pg = require('pg');
var credentials = require('./database');
var segmenter = require('./segmenter.js');
var myClient = new pg.Client(credentials);

//Connect to the database with one client specific to each user to avoid overflow of clients
myClient.connect(function(err){
    if (err){
        return console.error('could not connect to postgres', err);
    }
    else console.log('connection successufll');
});


/**
 * Checks if the user is logged in or not
 */
router.get('/loggedin', function (req, res) {
    var checkMe=undefined;
    if (req.user!=undefined) checkMe = req.user.userId +", "+req.user.userName;
    console.log(checkMe);
    res.send(checkMe+"");
});


/**
 * Returns the response containing the trips that the user has to annotate
 * In - userid
 */
router.post('/getAllUserTrips', function(req, res){
    var results = [];
    var userId = req.body.userId;

    var prioryQuery = myClient.query("select ap_get_server_response_for_user as response from ap_get_server_response_for_user("+userId+");");

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function(){
            return res.json(results[0]);
        });
});

/**
 * Returns all the locations that are not part of an inferred trip for stop detection
 * In - userid
 */
router.post('/getUnsegmentedStream', function(req, res){
    var results = [];
    var userId = req.user.userId;

    var prioryQuery = myClient.query("select ap_get_stream_for_stop_detection as response from ap_get_stream_for_stop_detection("+userId+");");

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function(){
            return res.json(results);
        });
});

/**
 * Grant access to user after handshake is complete
 */
router.post('/login', passport.authenticate('local'), function (req, res) {

    var user_id = {'userId':req.user.userId};
    console.log(user_id);
    res.send(JSON.stringify(user_id));
});

/**
 * Performs handshake via passport when the user is logging in
 */
router.get('/login', function (req, res) {
    res.send(req.user);
});

/**
 * Logs out the user sesion
 */
router.post('/logout', function (req, res) {
    req.logOut();
    res.send(200);
});

/**
 * Login and perform handshake
 */
router.post('/loginUser', function(req, res) {
    var results = [];
    var alreadyExists = false;
    // Grab data from http request
    var data = {username: req.body.username, password:req.body.password};
    console.log('user not existing');
    console.log(data);

    var prioryQuery = myClient.query("SELECT login_user as id FROM raw_data.login_user( '" + data.username+"' ,'"+data.password+"')");
    console.log(prioryQuery);

        prioryQuery.on('row', function (row) {
            alreadyExists=true;
            results.push(row);
            results.push(data.username);
        });

        prioryQuery.on('end', function(){
            if (results.length==0) res.end("incorrect");
            else return res.json(results);
        });
});

/**
 * Insert text from contact form into the database
 */
router.post('/contactForm', function(req, res) {
    var results = [];
    var data = req.body;

    var prioryQuery = myClient.query("Insert into contact_form(contact_name, email_address, phone_number, message) values($$"+data.contactName+"$$,$$"+data.emailAddress+"$$,$$"+data.phoneNumber+"$$,$$"+data.message+"$$)");

    prioryQuery.on('row', function (row) {
        results.push(row);
    });

    prioryQuery.on('end', function(){
        return res.json(results);
    });
});


/**
 * Register new user
 * In - user details: username, password, phone_model, phone_os
 */
router.post('/registerUser', function(req, res) {

    var results = [];

    // Grab data from http request
    var data = {username: req.body.username, password:req.body.password, phone_model:req.body.phone_model, phone_os:req.body.phone_os};
    var alreadyExists = false;
    var numberOfRowsReturned = 0;

    // Check if the username is already taken
    var prioryQuery = myClient.query("SELECT id FROM raw_data.user_table where username = '" + data.username+"'");

        prioryQuery.on('row', function (row) {
            // The user name is already taken
            numberOfRowsReturned++;
            alreadyExists=true;
        });

        if (numberOfRowsReturned>0) alreadyExists=true;

        prioryQuery.on('end', function(){
            if (alreadyExists) {
                // Inform the user that the username has been already taken
                res.end("username taken");
                return "username exists";
            } else {
                // SQL Query > Insert Data
                // New user name
                var query = myClient.query("select register_user as id from raw_data.register_user($1, $2, $3, $4)",
                    [data.username, data.password, data.phone_model, data.phone_os]);

                // Stream results back one row at a time
                query.on('row', function (row) {
                    results.push(row);
                });

                query.on('end', function () {
                    return res.json(results);
                });
            }});
});

/**
 * Description of how the user interactis via the client
 */
router.post('/insertLog',  function(req, res) {

    var data =  JSON.parse(req.body.dataToUpload);
    var userId = JSON.parse(req.body.userId);

    var sql ="INSERT INTO log_table(userid, log_date, log_message)";
    var values = [];

    for (var i=0; i<data.length;i++){
        var object =[];
        object.push("'"+userId+"'","'"+data[i].log_time+"'","'"+data[i].log_message+"'");
        values.push("("+object.toString()+")");
    }

        var prioryQuery = myClient.query(sql+ "values "+values.toString() , function(err) {
            if (err) {
                throw err;
            }
            else{
                res.end("success");
            }
        });
});


/**
 * Insert a location from the iOS devices
 */
router.post('/insertLocationsIOS',  function(req, res) {

    var data =  JSON.parse(req.body.dataToUpload);
    var sql = "INSERT INTO location_table (upload,  accuracy_, altitude_, bearing_, lat_, lon_, time_, speed_, satellites_, user_id, size, totalismoving, totalmax, totalmean, totalmin,"+
        "totalnumberofpeaks, totalnumberofsteps, totalstddev, "+
        "xismoving, xmaximum, xmean, xminimum, xnumberofpeaks, xstddev,"+
        "yismoving, ymax, ymean, ymin, ynumberofpeaks, ystddev, zismoving, zmax, zmean, zmin, znumberofpeaks, zstddev, "+
        "provider"+
        ")"; //+" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)";

    var values = [];
    var userId = 0;

    for (var i=0; i<data.length;i++){
        var object = [];
        userId = data[i].userid;
        object.push("'"+data[i].upload+"'", "'"+data[i].accuracy+"'", "'"+data[i].altitude+"'", "'"+data[i].bearing+"'", "'"+data[i].latitude+"'", "'"+data[i].longitude+"'",
            "'"+data[i].time_+"000'", "'"+data[i].speed_+"'", "'"+data[i].satellites_+"'", "'"+data[i].userid+"'",
            "'"+data[i].size+"'", "'"+data[i].totalIsMoving+"'", "'"+data[i].totalMax+"'", "'"+data[i].totalMean+"'", "'"+data[i].totalMin+"'",
            "'"+data[i].totalNumberOfPeaks+"'", "'"+data[i].totalNumberOfSteps+"'", "'"+data[i].totalStdDev+"'",
            "'"+data[i].xIsMoving+"'", "'"+data[i].xMax+"'", "'"+data[i].xMean+"'", "'"+data[i].xMin+"'", "'"+data[i].xNumberOfPeaks+"'", "'"+data[i].xStdDev+"'",
            "'"+data[i].yIsMoving+"'", "'"+data[i].yMax+"'", "'"+data[i].yMean+"'", "'"+data[i].yMin+"'", "'"+data[i].yNumberOfPeask+"'", "'"+data[i].yStdDev+"'",
            "'"+data[i].zIsMoving+"'", "'"+data[i].zMax+"'", "'"+data[i].zMean+"'", "'"+data[i].zMin+"'", "'"+data[i].zNumberOfPeaks+"'", "'"+data[i].zStdDev+"'", "'maybeGPS'");
        values.push("("+object.toString()+")");
    }

    if (data.length>0)

        var prioryQuery = myClient.query(sql+ "values "+values.toString() , function(err) {
            if (err) {
                res.end("failure");
                throw err;
            }
            else{
                res.end("success");
                // After a batch of insertions from the client, try and segment all residue data that are not already part of any trip
                // NOTE - this will probably make nodeJS hang since it is an intensive operation, offload to client based segmentation as soon as a final segmentation strategy has been decided on.
                segmenter.generateTrips(userId);
            }
        });
    else res.end("failure");
});

/**
 * Insert a location from the Android devices
 */
router.post('/insertLocationsAndroid',  function(req, res) {
    var data =  JSON.parse(req.body.embeddedLocations_);

    var userId = 0;
    var sql = "INSERT INTO location_table (upload,  accuracy_, altitude_, bearing_, lat_, lon_, time_, speed_, satellites_, user_id, size, totalismoving, totalmax, totalmean, totalmin,"+
        "totalnumberofpeaks, totalnumberofsteps, totalstddev, "+
        "xismoving, xmaximum, xmean, xminimum, xnumberofpeaks, xstddev,"+
        "yismoving, ymax, ymean, ymin, ynumberofpeaks, ystddev, zismoving, zmax, zmean, zmin, znumberofpeaks, zstddev, "+
        "provider"+
        ")"; //+" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)";


    var values = [];
    for (var i=0; i<data.length;i++){
        var object = [];
        var locationObject = data[i].currentLocation;
        var accelerometerObject = data[i].currentAcc;
        userId = locationObject.user_id;
        object.push("'true'", "'"+locationObject.accuracy_+"'", "'"+locationObject.altitude_+"'", "'"+locationObject.bearing_+"'", "'"+locationObject.lat_+"'", "'"+locationObject.lon_+"'",
            "'"+locationObject.time_+"'", "'"+locationObject.speed_+"'", "'"+locationObject.satellites_+"'", "'"+locationObject.user_id+"'",
            "'"+accelerometerObject.size+"'", "'"+accelerometerObject.totalIsMoving+"'", "'"+accelerometerObject.totalMax+"'", "'"+accelerometerObject.totalMean+"'", "'"+accelerometerObject.totalMin+"'",
            "'"+accelerometerObject.totalNumberOfPeaks+"'", "'"+accelerometerObject.totalNumberOfSteps+"'", "'"+accelerometerObject.totalStdDev+"'",
            "'"+accelerometerObject.xIsMoving+"'", "'"+accelerometerObject.xMaximum+"'", "'"+accelerometerObject.xMean+"'", "'"+accelerometerObject.xMinimum+"'", "'"+accelerometerObject.xNumberOfPeaks+"'", "'"+accelerometerObject.xStdDev+"'",
            "'"+accelerometerObject.yIsMoving+"'", "'"+accelerometerObject.yMax+"'", "'"+accelerometerObject.yMean+"'", "'"+accelerometerObject.yMin+"'", "'"+accelerometerObject.yNumberOfPeaks+"'", "'"+accelerometerObject.yStdDev+"'",
            "'"+accelerometerObject.zIsMoving+"'", "'"+accelerometerObject.zMax+"'", "'"+accelerometerObject.zMean+"'", "'"+accelerometerObject.zMin+"'", "'"+accelerometerObject.zNumberOfPeaks+"'", "'"+accelerometerObject.zStdDev+"'", "'"+locationObject.provider+"'");
        values.push("("+object.toString()+")");
    }
    if (data.length>0)
        var prioryQuery = myClient.query(sql+ "values "+values.toString() , function(err) {
            if (err) {
                res.end("failure");
                throw err;
            }
            else{
                res.end("OK");
                // After a batch of insertions from the client, try and segment all residue data that are not already part of any trip
                // NOTE - this will probably make nodeJS hang since it is an intensive operation, offload to client based segmentation as soon as a final segmentation strategy has been decided on.
                segmenter.generateTrips(userId);
            }
        });
    else res.end("failure");
});

/**
 * Segmenter inferred a trip from the stream of locations and inserts it in the database
 */
router.post('/insertInferredTrips',  function(req, res) {
    var trips =  req.body.tripArray;
    var sql ="INSERT INTO trips_inf(user_id, from_point_id, to_point_id, from_time, to_time, type_of_trip, purpose_id, destination_poi_id, length_of_trip, duration_of_trip, number_of_triplegs)";
    var values = [];

    for (var i=0; i<trips.length;i++){
        var object =[];
        object.push("'"+trips[i].user_id+"'","'"+trips[i].from_point_id+"'","'"+trips[i].to_point_id+"'","'"+trips[i].from_time+"'","'"+trips[i].to_time+"'","'"+trips[i].type_of_trip+"'","'"+trips[i].purpose_id+"'","'"+trips[i].destination_poi_id+"'","'"+trips[i].length_of_trip+"'","'"+trips[i].duration_of_trip+"'","'"+trips[i].number_of_triplegs+"'");
        values.push("("+object.toString()+")");
    }

    console.log(sql+ "values "+values.toString());
    if (data.length>0)
        var prioryQuery = myClient.query(sql+ "values "+values.toString() , function(err) {
            if (err) {
                 res.end("failure "+err);
                throw err;
            }
            else{
                 res.end("success");
            }
    });
});

/**
 * Gets the stream associated with a newly generated trip and detects triplegs
 */
router.post('/getTransportationSegmentsStream', function(req, res){

    var results = [];
    var userId = req.user.userId;
        var prioryQuery = myClient.query("select ap_get_stream_for_tripleg_detection as response from ap_get_stream_for_tripleg_detection("+userId+");");

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('end', function(){
            return res.json(results);
    });

});


/**
 * Inserts the inferred triplegs into the database
 */
router.post('/insertInferredTriplegs',  function(req, res) {

    var triplegs =  req.user.triplegArray;
    var sql ="INSERT INTO triplegs_inf(trip_id, user_id, from_point_id, to_point_id, from_time, to_time, type_of_tripleg, transportation_type , transition_poi_id, length_of_tripleg, duration_of_tripleg)";
    var values = [];
    for (var i=0; i<triplegs.length;i++){
        var object =[];
        object.push("'"+triplegs[i].trip_id+"'","'"+triplegs[i].user_id+"'","'"+triplegs[i].from_point_id+"'","'"+triplegs[i].to_point_id+"'","'"+triplegs[i].from_time+"'","'"+triplegs[i].to_time+"'","'"+triplegs[i].type_of_tripleg+"'","'"+triplegs[i].transportation_type+"'","'"+triplegs[i].transition_poi_id+"'","'"+triplegs[i].length_of_tripleg+"'","'"+triplegs[i].duration_of_tripleg+"'");
        values.push("("+object.toString()+")");
    }
        var prioryQuery = myClient.query(sql+ "values "+values.toString() , function(err) {
            if (err) {
                 res.end("failure "+err);
                throw err;
            }
            else{
                 res.end("success");
            }
         });
});

module.exports = router;
module.exports.client = myClient;