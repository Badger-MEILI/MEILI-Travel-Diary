
var Util = function(config) {
  return {
    formatTime: function(strDateTime, format) {
      var dateTime;
      if(strDateTime && strDateTime !== '') {
        var dateTimeInt = parseInt(strDateTime,10);
        dateTime = new Date(dateTimeInt);
        if(format) {
          dateTime = moment(dateTime).format(format);
        }
      }
      return dateTime;
    },

    sortByAccuracy: function(array) {
      if($.isArray(array)) {
        return array.sort(
          function(a, b) {
            if (a.accuracy < b.accuracy) {
              return 1;
            }

            if (a.accuracy > b.accuracy) {
              return -1;
            }

            if (a.name > b.name) {
              return 1;
            }

            return -1;
          });
      } else {
        return array;
      }
    }
  }
};