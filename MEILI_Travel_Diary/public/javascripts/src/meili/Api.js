
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

      updateEndTime: function(tripId, endTime) {
        return request.get(
          url(mainPaths.trips, 'updateEndTimeOfTrip'),
          {
            trip_id: tripId,
            end_time: endTime
          }
        );
      },

      updatePurposeOfTrip: function(tripId, purposeId) {
        return request.get(
          url(mainPaths.trips, 'updatePurposeOfTrip'),
          {
            trip_id: tripId,
            purpose_id: purposeId
          }
        );
      },

      updateDestinationPoiIdOfTrip: function(tripId, destinationPoiId) {
        return request.get(
          url(mainPaths.trips, 'updateDestinationPoiIdOfTrip'),
          {
            trip_id: tripId,
            destination_poi_id: destinationPoiId
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

      delete: function() {},

      insertTransitionBetweenTriplegs: function(tripId, startTime, endTime, fromMode, toMode) {
        return request.get(
          url(mainPaths.triplegs, 'insertTransitionBetweenTriplegs'),
          {
            trip_id: tripId,
            start_time: startTime,
            end_time: endTime,
            from_travel_mode: fromMode,
            to_travel_mode: toMode
          }
        );
      }
    }
  }
};

