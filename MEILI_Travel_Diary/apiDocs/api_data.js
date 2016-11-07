define({ "api": [
  {
    "type": "get",
    "url": "/pois/insertDestinationPoi&:name_&:latitude&:longitude&:declaring_user_id",
    "title": "Inserts a new destination POI declared by a user",
    "name": "InsertDestinationPoi",
    "group": "POIs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>name_</code>, <code>latitude</code>, <code>longitude</code>, <code>declaring_user_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name_",
            "description": "<p>Name of the inserted POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "latitude",
            "description": "<p>Latitude of the inserted POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "longitude",
            "description": "<p>Longitude of the inserted POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "declaring_user_id",
            "description": "<p>Id of the user that inserts the POI</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Id",
            "optional": false,
            "field": "The",
            "description": "<p>id of the inserted destination POI.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/pois.js",
    "groupTitle": "POIs"
  },
  {
    "type": "get",
    "url": "/pois/insertTransportationPoi&:name_&:latitude&:longitude&:declaring_user_id&:transportation_lines&:transportation_types",
    "title": "Inserts a new transportation POI declared by a user",
    "name": "InsertTransportationPoi",
    "group": "POIs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>name_</code>, <code>latitude</code>, <code>longitude</code>, <code>declaring_user_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name_",
            "description": "<p>Name of the inserted POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "latitude",
            "description": "<p>Latitude of the inserted POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "longitude",
            "description": "<p>Longitude of the inserted POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "declaring_user_id",
            "description": "<p>Id of the user that inserts the POI</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "transportation_lines",
            "description": "<p>(optional) The text representation of transport lines entered by the user</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "transportation_types",
            "description": "<p>(optional) The types of travel modes that are accessible to the station</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Id",
            "optional": false,
            "field": "The",
            "description": "<p>id of the inserted transportation POI.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/pois.js",
    "groupTitle": "POIs"
  },
  {
    "type": "get",
    "url": "/tests/populateWithTestData",
    "title": "Refreshes the test dataset by repopulating (by overwrite) apiv2 with test data",
    "name": "refreshTest",
    "group": "Tests",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Returns",
            "description": "<p>whether the test rollback was successfull or not</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/tests.js",
    "groupTitle": "Tests"
  },
  {
    "type": "get",
    "url": "/triplegs/deleteTripleg&:tripleg_id",
    "title": "Deletes the tripleg specified by id",
    "name": "DeleteTripleg",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>tripleg_id</code> is undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "tripleg_id",
            "description": "<p>Id of the tripleg that will be deleted</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after deletion</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/getAnnotatedTriplegsOfTrip&:trip_id",
    "title": "Gets the triplegs of an annotated given trip",
    "name": "GetAnnotatedTriplegsOfTrip",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>TripIdInvalid The <code>trip_id</code> is undefined or null.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "404",
            "description": "<p>TripIdNotFound The <code>trip_id</code> does not exist.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip for which the triplegs will be retrieved</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/getTriplegsOfTrip&:trip_id",
    "title": "Gets the triplegs of a given trip",
    "name": "GetTriplegsOfTrip",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>TripIdInvalid The <code>trip_id</code> is undefined or null.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "404",
            "description": "<p>TripIdNotFound The <code>trip_id</code> does not exist.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip for which the triplegs will be retrieved</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/insertTransitionBetweenTriplegs&:start_time&:end_time&:from_travel_mode&:to_travel_mode&:trip_id",
    "title": "Inserts a missed transition between two triplegs by splitting the existing affected tripleg",
    "name": "InsertTransitionBetweenTriplegs",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>tripleg_id</code> is undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip where the transition will be inserted</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "start_time",
            "description": "<p>Time at which the transition started</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "end_time",
            "description": "<p>Time at which the transition ended</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "from_travel_mode",
            "description": "<p>The travel mode from which the user changed</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "to_travel_mode",
            "description": "<p>The travel mode to which the user changed</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after the insertion of the transition tripleg</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/updateEndTimeOfTripleg&:tripleg_id&:end_time",
    "title": "Updates the end time of a tripleg",
    "name": "UpdateEndTimeOfTripleg",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>tripleg_id</code> or <code>end_time</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "tripleg_id",
            "description": "<p>Id of the tripleg that will have its end date modified.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "end_time",
            "description": "<p>The new value for the end time of the specified tripleg</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/updateStartTimeOfTripleg&:tripleg_id&:start_time",
    "title": "Updates the start time of a tripleg",
    "name": "UpdateStartTimeOfTripleg",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>tripleg_id</code> or <code>start_time</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "tripleg_id",
            "description": "<p>Id of the tripleg that will have its start date modified.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "start_time",
            "description": "<p>The new value for the start time of the specified tripleg</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/updateTransitionPoiIdOfTripleg&:tripleg_id&:transition_poi_id",
    "title": "Updates the travel mode of a tripleg",
    "name": "UpdateTransitionPoiIdOfTripleg",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>tripleg_id</code> or <code>transition_poi_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "tripleg_id",
            "description": "<p>Id of the tripleg that will have its travel mode updated</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "transition_poi_id",
            "description": "<p>The new value for the transition poi id of the specified tripleg</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Boolean",
            "description": "<p>Returns whether the operation was successfull or not.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/triplegs/updateTravelModeOfTripleg&:tripleg_id&:travel_mode",
    "title": "Updates the travel mode of a tripleg",
    "name": "UpdateTravelModeOfTripleg",
    "group": "Triplegs",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>tripleg_id</code> or <code>travel_mode</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "tripleg_id",
            "description": "<p>Id of the tripleg that will have its travel mode updated</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "travel_mode",
            "description": "<p>The new value for the travel mode of the specified tripleg</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Boolean",
            "description": "<p>Returns whether the operation was successfull or not.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/triplegs.js",
    "groupTitle": "Triplegs"
  },
  {
    "type": "get",
    "url": "/trips/confirmAnnotationOfTrip&:trip_id&",
    "title": "Confirms the annotations of a trip, which moves the user to the next unannotated trip",
    "name": "ConfirmAnnotationOfTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameter <code>trip_id</code> is undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip whose annotations are confirmed</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Trip",
            "optional": false,
            "field": "Trip",
            "description": "<p>The json representation of a trip without its triplegs</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/deleteTrip&:trip_id",
    "title": "Deletes a trip",
    "name": "DeleteTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameter <code>trip_id</code> is undefined, null or of a wrong type.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip that will be deleted</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Trip",
            "optional": false,
            "field": "Trip",
            "description": "<p>Gets the json representation of the next trip to process for the user that performed the action.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/getLastTripOfUser&:user_id",
    "title": "Gets the earliest unannotated trip of the user",
    "name": "GetLastTripOfUser",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>UserIdInvalid The <code>user_id</code> is undefined or null.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>UserCannotAnnotate The user with <code>user_id</code> does not have any trips to annotate.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "user_id",
            "description": "<p>Id of the user that requests the earliest unannotated trip</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Trip",
            "optional": false,
            "field": "Trip",
            "description": "<p>The json representation of a trip without its triplegs</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/getTripsForBadge&:user_id",
    "title": "Gets the number of trips that the user has to process",
    "name": "GetTripsForBadge",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>UserIdInvalid The <code>user_id</code> is undefined or null.</p>"
          }
        ]
      }
    },
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
            "type": "Number",
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
  },
  {
    "type": "get",
    "url": "/trips/insertPeriodBetweenTrips&:start_time&:end_time&:user_id",
    "title": "Inserts a missed non movement period between two trips by splitting the existing affected trip",
    "name": "InsertPeriodBetweenTris",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>user_id</code>, <code>start_time</code> or <code>end_time</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "user_id",
            "description": "<p>Id of the user who inserts the period between trips</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "start_time",
            "description": "<p>Time at which the non movement period started</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "end_time",
            "description": "<p>Time at which the non movement period ended</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Trip",
            "optional": false,
            "field": "Trip",
            "description": "<p>Gets the json representation of the next trip to process for the user that performed the action.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/mergeWithNextTrip&:trip_id",
    "title": "Merges a trip with its neighbor",
    "name": "MergeWithNextTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>trip_id</code> is undefined, null or of a wrong type.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip that will be merged with its neighbor</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after the merge is performed</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/navigateToNextTrip&:trip_id&:user_id",
    "title": "Navigates to the next annotated trip, if it exists",
    "name": "NavigateToNextTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameter <code>trip_id</code> or <code>user_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip whose proceeding neighbor is retrieved</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "user_id",
            "description": "<p>Id of the user that annotates the trip</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Trip",
            "optional": false,
            "field": "Trip",
            "description": "<p>The json representation of a trip without its triplegs, and a status field with values &quot;already_annotated&quot;, if the trip's time intervals should not be modifiable, or &quot;needs_annotation&quot; if the trip is the same with the response for getLastTripOfUser</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/navigateToPreviousTrip&:trip_id&:user_id",
    "title": "Navigates to the previous annotated trip, if it exists",
    "name": "NavigateToPreviousTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameter <code>trip_id</code> or <code>user_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip whose preceeding neighbor is retrieved</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "user_id",
            "description": "<p>Id of the user that annotates the trip</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Trip",
            "optional": false,
            "field": "Trip",
            "description": "<p>The json representation of a trip without its triplegs (empty when the preceeding trip does not exist), and a status field with values &quot;already_annotated&quot;, if the trip's time intervals should not be modifiable, or &quot;INVALID&quot; if the navigation works unexpected</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/updateDestinationPoiIdOfTrip&:trip_id&:destination_poi_id",
    "title": "Updates the destination poi id of a trip",
    "name": "UpdateDestinationPoiIdOfTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>trip_id</code> or <code>destination_poi_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip that will have its destination poi id updated</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "destination_poi_id",
            "description": "<p>The new value for the destination_poi_id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Boolean",
            "description": "<p>The success state of the operation.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/updateEndTimeOfTrip&:trip_id&:end_time",
    "title": "Updates the end time of a trip",
    "name": "UpdateEndTimeOfTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>trip_id</code> or <code>end_time</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip that will have its end time modified.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "end_time",
            "description": "<p>The new value for the end time of the specified trip</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/updatePurposeOfTrip&:trip_id&:purpose_id",
    "title": "Updates the purpose of a trip",
    "name": "UpdatePurposeOfTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>trip_id</code> or <code>purpose_id</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip that will have its purpose updated</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "purpose_id",
            "description": "<p>The new value for the purpose_id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "Boolean",
            "description": "<p>The success state of the operation.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  },
  {
    "type": "get",
    "url": "/trips/updateStartTimeOfTrip&:trip_id&:start_time",
    "title": "Updates the start time of a trip",
    "name": "UpdateStartTimeOfTrip",
    "group": "Trips",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "400",
            "description": "<p>InvalidInput The parameters <code>trip_id</code> or <code>start_time</code> are undefined, null or of wrong types.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": true,
            "field": "500",
            "description": "<p>SQLError SQL error traceback.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "trip_id",
            "description": "<p>Id of the trip that will have its start date modified.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "start_time",
            "description": "<p>The new value for the start time of the specified trip</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Tripleg[]",
            "optional": false,
            "field": "Triplegs",
            "description": "<p>An array of json objects that represent the triplegs of the trip after update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/apiv2/trips.js",
    "groupTitle": "Trips"
  }
] });
