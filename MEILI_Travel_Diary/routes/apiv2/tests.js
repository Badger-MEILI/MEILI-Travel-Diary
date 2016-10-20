/**
 * Created by adi on 2016-10-20.
 */

var express = require('express');
var reqClient = require('../users');
var apiClient = reqClient.client;
var router = express.Router();
var util = require('./util');

/**
 * @api {get} /tests/populateWithTestData Refreshes the test dataset by repopulating (by overwrite) apiv2 with test data
 * @apiName refreshTest
 * @apiGroup Tests
 *
 * @apiError [500] SQLError SQL error traceback.
 *
 * @apiSuccess {Boolean} Returns whether the test rollback was successfull or not
 */
router.get("/populateWithTestData", function(req,res){

    var results = [];
        var sqlQuery = "select * from tests.refresh_test_data()";

        var prioryQuery = apiClient.query(sqlQuery);

        prioryQuery.on('row', function (row) {
            results.push(row);
        });

        prioryQuery.on('error', function(row){
            res.status(500);
            return util.handleError(res, 500, row.message);
        });

        prioryQuery.on('end', function () {
            return res.json(results.length>0);
        });
});

module.exports = router;