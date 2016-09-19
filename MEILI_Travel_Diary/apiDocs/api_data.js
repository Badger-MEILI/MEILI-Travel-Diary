define({ "api": [
  {
    "type": "get",
    "url": "/trips/getTripsForBadge&:user_id",
    "title": "Gets the number of trips that the user has to process",
    "name": "GetTripsForBadge",
    "group": "Trips",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "user_id",
            "description": "<p>Id of the user that requests the number of available unannotated trips.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user_get_badge_trips_info",
            "description": "<p>Number of unannotated trips available to the user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  }
] });
