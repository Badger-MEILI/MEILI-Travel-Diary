
var request = Request();

var Api = function(config) {

  var mainPaths = {
    trips: 'trips',
    triplegs: 'triplegs'
  };

  function url(mainPath, path) { return [config.api_host, config.api_url, mainPath, path].join('/') };

  function verifyTriplegsIsReturned(dfd, result) {
    if(result.triplegs && result.triplegs.length > 0) {
      dfd.resolve(result);
    } else {
      var msg = 'No triplegs returned';
      log.error('Api -> verifyTriplegsIsReturned', msg);
      dfd.reject(msg);
      throw msg;
    }
  }

  return {

    users: {
      loggedIn: function() {
        return request.get([config.api_host, 'users/loggedin'].join('/'));
      },

      login: function(username, password) {
        return request.post([config.api_host, 'users/login'].join('/'), {
          username: username,
          password: password
        });
      }
    },

    trips: {

      getLast: function(userId){
        return request.get(url(mainPaths.trips, 'getLastTripOfUser'), { user_id: userId });
      },

      getNumberOfTrips: function(userId) {
        return request.get(url(mainPaths.trips, 'getTripsForBadge'), { user_id: userId });
      },

      updateStartTime: function(tripId, startTime) {
        return request.get(
          url(mainPaths.trips, 'updateStartTimeOfTrip'),
          {
            trip_id: tripId,
            start_time: startTime
          },
          verifyTriplegsIsReturned
        );
      },

      updateEndTime: function(tripId, endTime) {
        return request.get(
          url(mainPaths.trips, 'updateEndTimeOfTrip'),
          {
            trip_id: tripId,
            end_time: endTime
          },
          verifyTriplegsIsReturned
        );
      },

      updatePurposeOfTrip: function(tripId, purposeId) {
        return request.get(
          url(mainPaths.trips, 'updatePurposeOfTrip'),
          {
            trip_id: tripId,
            purpose_id: purposeId
          },
          function(dfd, result) {
            if(result.status == true) {
              dfd.resolve(result);
            } else {
              var msg = 'Some problem updating purpose of trip, server responded with incorrect status';
              log.error('Api -> updatePurposeOfTrip', msg);
              dfd.reject(msg);
              throw msg;
            }
          }
        );
      },

      updateDestinationPoiIdOfTrip: function(tripId, destinationPoiId) {
        return request.get(
          url(mainPaths.trips, 'updateDestinationPoiIdOfTrip'),
          {
            trip_id: tripId,
            destination_poi_id: destinationPoiId
          },
          function(dfd, result) {
            if(result.status == true) {
              dfd.resolve(result);
            } else {
              var msg = 'Some problem updating destination poi of trip, server responded with incorrect status';
              log.error('Api -> updateDestinationPoiIdOfTrip', msg);
              dfd.reject(msg);
              throw msg;
            }
          }
        );
      },

      navigateToPreviousTrip: function(userId, tripId) {
        return request.get(
          url(mainPaths.trips, 'navigateToPreviousTrip'),
          {
            trip_id: tripId,
            user_id: userId
          }
        );
      },

      navigateToNextTrip: function(userId, tripId) {
        return request.get(
          url(mainPaths.trips, 'navigateToNextTrip'),
          {
            trip_id: tripId,
            user_id: userId
          }
        );
      },

      confirmAnnotationOfTrip: function(tripId) {
        return request.get(
          url(mainPaths.trips, 'confirmAnnotationOfTrip'),
          {
            trip_id: tripId
          }
        );
      },

      delete: function(tripId) {
        return request.get(
          url(mainPaths.trips, 'deleteTrip'),
          {
            trip_id: tripId
          },
          verifyTriplegsIsReturned
        );
      },

      mergeWithNext: function(tripId) {
        return request.get(
          url(mainPaths.trips, 'mergeWithNextTrip'),
          {
            trip_id: tripId
          },
          verifyTriplegsIsReturned
        );
      }
    },

    triplegs: {

      get: function(tripId){
        return request.get(
          url(mainPaths.triplegs, 'getTriplegsOfTrip'),
          { trip_id: tripId }
        );
      },

      updateStartTime: function(triplegId, startTime) {
        return request.get(
          url(mainPaths.triplegs, 'updateStartTimeOfTripleg'),
          {
            tripleg_id: triplegId,
            start_time: startTime
          },
          verifyTriplegsIsReturned
        );
      },

      updateEndTime: function(triplegId, endTime) {
        return request.get(
          url(mainPaths.triplegs, 'updateEndTimeOfTripleg'),
          {
            tripleg_id: triplegId,
            end_time: endTime
          },
          verifyTriplegsIsReturned
        );
      },

      updateMode: function(triplegId, travelMode) {
        return request.get(
          url(mainPaths.triplegs, 'updateTravelModeOfTripleg'),
          {
            tripleg_id: triplegId,
            travel_mode: travelMode
          },
          function(dfd, result) {
            if(result.status == true) {
              dfd.resolve(result);
            } else {
              var msg = 'Some problem updating mode, server responded with incorrect status';
              log.error('Api -> updateMode', msg);
              dfd.reject(msg);
              throw msg;
            }
          }
        );
      },

      delete: function(triplegId) {
        return request.get(
          url(mainPaths.triplegs, 'deleteTripleg'),
          {
            tripleg_id: triplegId
          },
          verifyTriplegsIsReturned
        );
      },

      insertTransitionBetweenTriplegs: function(tripId, startTime, endTime, fromMode, toMode) {
        return request.get(
          url(mainPaths.triplegs, 'insertTransitionBetweenTriplegs'),
          {
            trip_id: tripId,
            start_time: startTime,
            end_time: endTime,
            from_travel_mode: fromMode,
            to_travel_mode: toMode
          },
          verifyTriplegsIsReturned
        );
      },

      updateTransitionPoiIdOfTripleg: function(triplegId, transitionPoiId) {
        return request.get(
          url(mainPaths.triplegs, 'updateTransitionPoiIdOfTripleg'),
          {
            tripleg_id: triplegId,
            transition_poi_id: transitionPoiId
          },
          function(dfd, result) {
            if(result.status == true) {
              dfd.resolve(result);
            } else {
              var msg = 'Some problem updating transition poi of tripleg, server responded with incorrect status';
              log.error('Api -> updateTransitionPoiIdOfTripleg', msg);
              dfd.reject(msg);
              throw msg;
            }
          }
        );
      }
    }
  }
};

