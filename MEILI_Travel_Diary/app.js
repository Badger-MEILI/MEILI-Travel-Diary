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
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pg = require('pg');
var credentials = require('./routes/database');

var reqClient = require('./routes/users');
var myClient = reqClient.client;

var routes = require('./routes/index');
var users = require('./routes/users');

var api = require('./routes/api');

var testEndPoint = require('./routes/apiv2/tests');
var tripEndPoint = require('./routes/apiv2/trips');
var triplegsEndPoint = require('./routes/apiv2/triplegs');
var poisEndPoint = require('./routes/apiv2/pois');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/**
 * AUTHORIZATION SEGMENT
 *
 **/

var segmenter = require('./routes/segmenter.js');

// Login Function
// Defines the strategy to be used by PassportJS
passport.use(new LocalStrategy(
    function(username, password, done) {
        var results = [];

        //call database for login
        var prioryQuery = myClient.query("SELECT login_user as id FROM raw_data.login_user('" + username+"', '"+password+"')");

        prioryQuery.on('row', function (row) {
                // push retrieved id from database
                results.push(row);
            });

            prioryQuery.on('end', function(){

                console.log(results);

                if (results[0].id!=null && results[0].id!=undefined){
                    //retrieved id successfully
                    done(null, {userId: results[0].id, userName: username});
                }
                else
                {
                    //failed to login
                    done(null, false, { message: 'Incorrect username.' });
                }
            });
    }
));

// Serialize method for handshake type of caching
passport.serializeUser(function(user, done) {
    done(null, user);
});

// Deserialize method for handshake type of caching
passport.deserializeUser(function(user, done) {
    done(null, user);
});

var auth = function (req, res, next) {
    if (!req.isAuthenticated()) {
        //return status 401 since the user does not have access to the component
        res.status(401).end();
    }
    else {
        //passed authentication filter
        next();
    }
};

var app = express();
app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '150mb'}));

// view engine setup - it is set with the public folder views
app.set('views', path.join(__dirname, 'public/views'));
// specifically require html for rendering
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// TODO - figure out if this is needed
    app.use(session({secret: 'blahblah',resave: false,
    saveUninitialized: true}));

// declare and initialize passport
app.use(passport.initialize());
app.use(passport.session());


// login is public since it will perform the handshake
app.use('/users', users);


// only accessible after doing the handshake
app.use('/api', auth,api);

// only accessible after doing the handshake
app.use('/apiv2/trips', auth, tripEndPoint);
app.use('/apiv2/triplegs', auth, triplegsEndPoint);
app.use('/apiv2/pois', auth, poisEndPoint);
app.use('/apiv2/tests', auth, testEndPoint);

// default fallback
app.use('/', routes);

app.disable('etag');

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.all("/*", routes);

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log('error '+err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;