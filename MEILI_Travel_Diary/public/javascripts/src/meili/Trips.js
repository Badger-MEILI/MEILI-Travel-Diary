
var request = Request();

var Trips = function(config) {

  function url(path) { return [config.api_url, 'trips', path].join('/') };

  return {

    getLast: function(userId){
      return request.get(url('getLastTripOfUser'), { user_id: userId });
    },

    getNumberOfTrips: function() {
      return request.get(url('getTripsForBadge'), { user_id: userId });
    },

    create: function() {},
    update: function() {},
    delete: function() {}
  }
};

