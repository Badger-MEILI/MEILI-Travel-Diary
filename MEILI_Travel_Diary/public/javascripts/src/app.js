/*
 MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

 Copyright (C) 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/
 Copyright (C) 2016 adIT AI - https://github.com/adIT-AI

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

'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('app', ['ngRoute', 'ngResource'/*, 'leaflet-directive'*/])
    .config(function($routeProvider, $locationProvider, $httpProvider) {
        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){

            console.log("checking logged in");

            var userId = $rootScope.userId;
            var userName = "";
            console.log(userId);

            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/users/loggedin').success(function(user){
                console.log(user);
                userId = user.split(",")[0];
                userName = user.split(",")[1];
                if (userName!=undefined)
                    userName = userName.split("@")[0];
                //console.log(userName);
                //console.log(userName.split("@")[0]);
                // userName =userName.split('@')[0];

                if (getLanguage()=="en")
                {$rootScope.message = 'Authentication successful!';
                    $rootScope.actionMessage = 'Welcome, '+ userName;}
                else
                {$rootScope.message = 'Authentication successful!';
                    $rootScope.actionMessage = 'Vällkommen, '+ userName;}

                // Authenticated
                if (userId !== undefined && userId !== "undefined")
                {
                    $timeout(function(){
                        $rootScope.userId = userId;
                        deferred.resolve('Done');
                    console.log('resolved');
                    }, 0);
                  //  console.log($location);
                }

                // Not Authenticated
                else {
                    console.log("Not authenticated");
                    $rootScope.message = 'You need to log in.';
                    $timeout(function(){deferred.reject();console.log('rejected');}, 0);
                    $location.url('/login');
                }
            })
                .error(function(){
                    console.log('some error');
                });
            return deferred.promise;
        };
        //================================================

        //================================================
        // Add an interceptor for AJAX errors
        //================================================

// register the interceptor as a service


        $httpProvider.interceptors.push(function($q, $location) {
            return function(promise) {
                return promise.then(
                // Success: just return the response
                    function(response){
                        console.log('caught something good');
                        return response;
                    },
                    // Error: check the error status to get only the 401
                    function(response) {
                        console.log('caught something bad '+ response.status);
                        if (response.status === 401)
                            $location.url('/login');
                        return $q.reject(response);
                    }
                );
            }
        });

        //================================================

        //================================================
        // Define all the routes
        //================================================
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'LoginCtrl'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/map', {
                templateUrl: 'views/map.html',
                controller: 'MapCtrl',
                resolve: { loggedin: checkLoggedin }
            })
            .when('/FAQ', {
                templateUrl: 'views/FAQ.html',
                controller: 'FAQCtrl'
            })
            .when('/About', {
                templateUrl: 'views/About.html',
                controller: 'aboutCtrl'
            })
            .when('/Statistics', {
                templateUrl: 'views/Statistics.html',
                controller: 'statisticsCtrl',
                resolve: { loggedin: checkLoggedin }
            })
            .when('/Contact', {
                templateUrl: 'views/Contact.html',
                controller: 'contactCtrl'
            })
            .otherwise({
                templateUrl: 'views/main.html'
            });
        //$locationProvider.html5Mode(true);
        //================================================

    }) // end of config()

    .run(function($rootScope, $http){
        $rootScope.message = '';

       /* // Logout function is available in any pages
        $rootScope.logout = function(){
            $rootScope.message = 'Logged out.';
            $http.post('/logout');
        };*/
    })

/**
 * adjust for offset when scrolling
 */
    .run(['$anchorScroll', function($anchorScroll) {
    $anchorScroll.yOffset = 130;   // always scroll by 50 extra pixels
    }]);

app.service('translationService', function($resource) {
    this.getTranslation = function($rootScope, language) {
        var languageFilePath = '../Translation/translation_' + language + '.json';
        //console.log($resource);
        $resource(languageFilePath).get(function (data) {
          //  console.log(data);
            $rootScope.translation = data;
        });
    };
});

/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location, translationService) {

    //if (getLanguage()=="en")
        var assistantHelper =document.getElementById('assistant');
    /*else
        var assistantHelper = document.getElementById('assistantSv');*/
    assistantHelper.style.visibility =  "hidden";

    // This object will be filled by the form

    $rootScope.user = {};

    $rootScope.translate = function(){
        translationService.getTranslation($rootScope, $scope.selectedLanguage);
    };

    //Init
    if (!$rootScope.hasOwnProperty('selectedLanguage'))
    {
        $rootScope.selectedLanguage = 'en';
    }
    $rootScope.translate();


    $rootScope.actionMessage = 'Please log in';

    // Register the login() function
    $rootScope.login = function(){
        $http.post('/users/login', {
            username: $rootScope.user.username,
            password: $rootScope.user.password,
            //userId : $rootScope.user.userId,
            cache:true
        })
            .success(function(user){
                console.log('great success');
                console.log(user);
                // No error: authentication OK
                if (getLanguage()=="en")
                {$rootScope.message = 'Authentication successful!';
                $rootScope.actionMessage = 'Welcome, '+$rootScope.user.username;}
                else{$rootScope.message = 'Authentication successful!';
                    $rootScope.actionMessage = 'Välkommen, '+$rootScope.user.username;
                }
                $rootScope.userId = user.userId;
                console.log($rootScope.userId);
                //console.log($rootScope);
                //direct to the map view
                $location.path('/map');


            })
            .error(function(error){
                alert('The supplied username and password are incorrect');
                console.log('great failure');
                console.log(error);
                // Error: authentication failed
                $rootScope.message = 'Authentication failed.';
                $location.path('/login');

            });
    };
});


function getJson(str) {
    try {
        JSON.parse(str+"");
    } catch (e) {
        return str;
    }
    return JSON.parse(str);
}


/**********************************************************************
 * Map controller
 **********************************************************************/
var currentTrip;
var log         = Log(CONFIG);
var api         = Api(CONFIG);
var ui;

app.controller('MapCtrl',function($scope, $rootScope, $http, $location, $anchorScroll, translationService) {
    // This object will be filled by the form
    $scope.user = {};
    $scope.userId = $rootScope.userId;
    console.log('called map ctr');

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";


    $rootScope.translate = function(){
        translationService.getTranslation($rootScope, $scope.selectedLanguage);
    };

    //Init
    if (!$rootScope.hasOwnProperty('selectedLanguage'))
    {
        $rootScope.selectedLanguage = 'en';
    }
    $rootScope.translate();    forceLoad();

    /**
     * end of function
     */

    angular.extend($scope, {
        defaults: {
            scrollWheelZoom: false
        }
    });

    //initmap($scope.userId);
    var userId = $scope.userId;


    ui = {
      map: new LMap(),
      timeline: new Timeline({ elementId: 'timeline'})
    };
    var user = new User(userId);


    user.getNumberOfTrips(userId)
      .done(function(result) {
        document.getElementById('tripsLeft').innerHTML = result.rows[0].user_get_badge_trips_info;
        document.getElementById('badge_holder').style.visibility = "visible";
    });

    user.getLastTrip()
      .done(function(trip) {
        // TODO move me
        trip.on('triplegs-update', function(trip) {
          renderTrip(trip);
        });

        ui.timeline.on('start-time-change', trip.updateStartTime.bind(trip));
        ui.timeline.on('end-time-change',   trip.updateEndTime.bind(trip));

        ui.map.init(CONFIG.map, userId);

        renderTrip(trip);
        map.fitBounds(trip.mapLayer.getBounds());
/*
        var assistantHelper = document.getElementById('assistant');
        assistantHelper.style.visibility = "visible";
        assistantHelper.addEventListener("click", enablingListener);

        enableMapScrolling();*/
      })
      .fail(function() {
        alert('Please come back later, there are not enough trips to show you yet');
      });

    function renderTrip(trip) {
      // TODO! move into Trip..

      // Reset.
      if(trip.mapLayer) {
        trip.mapLayer.clearLayers();
        map.removeLayer(trip.mapLayer);
      }

      // Render timeline
      ui.timeline.render(trip);

      // Render map
     for (var i=0; i < trip.triplegs.length; i++) {
        var tripleg = trip.triplegs[i];
        var triplegLayer = tripleg.generateMapLayer();
        trip.mapLayer.addLayer(triplegLayer);
      }
      trip.mapLayer.addTo(map);
    }



    /**
     *
     * Function for anchor scrolling for angular
     */
    $scope.scrollTo = function(id) {
        var old = $location.hash();
        $location.hash(id);
        console.log($location.hash());

        $anchorScroll();
        //reset to old to keep any additional routing logic from kicking in
        $location.url($location.path());
    };

    // Register the api() function
    $scope.api = function(){
        $http.get('/api/getAll', {})
            .success(function(){
                // No error: authentication OK
                $rootScope.message = 'Got something from somewhere';
                //direct to the map view

            })
            .error(function(){
                // Error: authentication failed
                $rootScope.message = 'Not working.';
                //$location.url('/login');
            });
    };
});

/**********************************************************************
 * FAQ controller
 **********************************************************************/

app.controller('FAQCtrl',function($scope, $rootScope, $http, $location, translationService) {
    if (getLanguage()=="en")
        document.getElementById('assistant')
    else
        var assistantHelper = document.getElementById('assistantSv');
    assistantHelper.style.visibility = "hidden";

    $rootScope.translate = function(){
        translationService.getTranslation($rootScope, $scope.selectedLanguage);
    };

    //Init
    if (!$rootScope.hasOwnProperty('selectedLanguage'))
    {
        $rootScope.selectedLanguage = 'en';
    }
    $rootScope.translate();    forceLoad();
});

app.controller('aboutCtrl', function($scope, $rootScope, $http, $location, translationService) {
    if (getLanguage()=="en")
        document.getElementById('assistant')
    else
        var assistantHelper = document.getElementById('assistantSv');
    assistantHelper.style.visibility = "hidden";

    $rootScope.translate = function(){
        translationService.getTranslation($rootScope, $scope.selectedLanguage);
    };

    //Init
    if (!$rootScope.hasOwnProperty('selectedLanguage'))
    {
        $rootScope.selectedLanguage = 'en';
    }
    $rootScope.translate();
    forceLoad();
});


app.controller('statisticsCtrl',function($scope, $rootScope, $http, $location, translationService) {

    $rootScope.translate = function(){
        translationService.getTranslation($rootScope, $scope.selectedLanguage);
    };

    //Init
    if (!$rootScope.hasOwnProperty('selectedLanguage'))
    {
        $rootScope.selectedLanguage = 'en';
    }
    $rootScope.translate();

    initGraphs($scope.userId);
});

app.controller('contactCtrl', function($scope, $rootScope, $http, $location, translationService) {
    if (getLanguage()=="en")
        document.getElementById('assistant')
    else
        var assistantHelper = document.getElementById('assistantSv');
    assistantHelper.style.visibility = "hidden";

    $rootScope.translate = function(){
        translationService.getTranslation($rootScope, $scope.selectedLanguage);
    };

    //Init
    if (!$rootScope.hasOwnProperty('selectedLanguage'))
    {
        $rootScope.selectedLanguage = 'en';
    }
    $rootScope.translate();
    forceLoad();
});

/**********************************************************************
 * Admin controller
 **********************************************************************/
/*app.controller('AdminCtrl', function($scope, $http) {

    $scope.$on("$routeChangeError", function () {
        console.log("failed to change routes");
    });
    // List of users got from the server
    $scope.users = [];
    console.log('was');
    // Fill the array to display it in the page
    $http.get('/users').success(function(users){
        for (var i in users)
            $scope.users.push(users[i]);
    });
});*/