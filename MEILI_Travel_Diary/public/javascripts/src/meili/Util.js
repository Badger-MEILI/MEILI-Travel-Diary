
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
    }
  }
};