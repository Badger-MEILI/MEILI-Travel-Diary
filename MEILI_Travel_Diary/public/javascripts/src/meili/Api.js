
var request = Request();

var Api = function(config) {

  var mainPaths = {
    trips: 'trips',
    triplegs: 'triplegs'
  };

  function url(mainPath, path) { return [config.api_url, mainPath, path].join('/') };

  return {

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
          }
        );
      },

      updateEndTime: function(triplegId, endTime) {
        return request.get(
          url(mainPaths.trips, 'updateEndTimeOfTrip'),
          {
            tripleg_id: triplegId,
            end_time: endTime
          }
        );
      },

      create: function() {},
      update: function() {},
      delete: function() {}
    },

    triplegs: {

      get: function(tripId){
        return request.get(
          url(mainPaths.triplegs, 'getTriplegsOfTrip'),
          { trip_id: tripId }
        );
      },

      create: function() {},

      updateStartTime: function(triplegId, startTime) {
        return request.get(
          url(mainPaths.triplegs, 'updateStartTimeOfTripleg'),
          {
            tripleg_id: triplegId,
            start_time: startTime
          }
        );
      },

      updateEndTime: function(triplegId, endTime) {
        return request.get(
          url(mainPaths.triplegs, 'updateEndTimeOfTripleg'),
          {
            tripleg_id: triplegId,
            end_time: endTime
          }
        );
      },

      updateMode: function(triplegId, travelMode) {
        return request.get(
          url(mainPaths.triplegs, 'updateTravelModeOfTripleg'),
          {
            tripleg_id: triplegId,
            travel_mode: travelMode
          }
        );
      },

      delete: function() {}
    }
  }
};

