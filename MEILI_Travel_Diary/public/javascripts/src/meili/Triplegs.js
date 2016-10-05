
var request = Request();

var Triplegs = function(config) {

  function url(path) { return [config.api_url, 'triplegs', path].join('/') };

  return {

    get: function(tripId){
      return request.get(
        url('getTriplegsOfTrip'),
        { trip_id: tripId }
      );
    },

    create: function() {},
    updateStartTime: function(triplegId, startTime) {
      return request.get(
        url('updateStartTimeOfTripleg'),
        {
          tripleg_id: triplegId,
          start_time: startTime
        }
      );
    },
    delete: function() {}
  }
};

