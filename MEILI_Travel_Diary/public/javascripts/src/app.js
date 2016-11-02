'use strict';

var log = new Log(CONFIG);
var api = Api(CONFIG);
var ui  = {};

$(function() {

    var user = new User();
    var login = new Login(user);
    ui.errorMsg = new ErrorMsg();

    // Catch all client errors
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
        log.error('Window -> onerror', errorMsg, url, lineNumber, column, errorObj);
        ui.errorMsg.show(errorMsg);
    };

    // Render a document
    function render(path, callback) {
        // Getting document
        request.get(path)
            .done(function(content) {
                // Render it to #content
                var $contentRef = $('#content');
                $contentRef.empty().append(content);
                if(callback) {
                    // procceed
                    callback($contentRef);
                }
            });
    }

    // Call server to verify that the user is logged in
    function verifyLoggedIn(callback) {
        user.verifyLoggedIn()
            .done(function() {
                callback();
            })
            .fail(function() {
                page('/login');
            });
    }

     function renderTrip(trip) {
      // TODO! move into Trip..

      // Reset.
      if(trip.mapLayer) {
        trip.mapLayer.clearLayers();
        map.removeLayer(trip.mapLayer);
      }

      trip.generateMapLayer();

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


    // Routing
    // -------------------------------------------
    // -------------------------------------------

    // Resolve old paths
    page('/#/*', function(ctx, next) {
        var p = ctx.path.split('/');
        var path = p[p.length-1];
        if(path) {
            page('/'+path);
        } else {
            page('/');
        }
    })

    page('/', function(ctx, next) {
        render('views/partials/main.html');
    });

    page('/login', function(ctx, next) {
        render('views/partials/login.html', function() { next(); });
    });

    page('/map', function(ctx, next) {
        verifyLoggedIn(function() {
            render('views/partials/map.html', function() {
                ui.map = new LMap();
                ui.timeline = new Timeline({ elementId: 'timeline'});

                user.getNumberOfTrips()
                  .done(function(result) {
                    $('#tripsLeft').html(result.rows[0].user_get_badge_trips_info);
                    $('#badge_holder').show();
                });

                user.getLastTrip()
                  .done(function(trip) {
                    // TODO move me
                    trip.on('trip-confirm', function(trip) {
                        user.confirmTrip(trip.getId());
                    });

                    user.on('current-trip-changed', function(trip) {
                        renderTrip(trip);
                    });

                    trip.on('trip-update', function(trip) {
                      renderTrip(trip);
                    });
                    trip.on('triplegs-update', function(trip) {
                      renderTrip(trip);
                    });

                    ui.timeline.on('start-time-change', function(triplegId, newStartTime) {
                        var tripleg = trip.getTriplegById(triplegId);
                        if(tripleg.isFirst) {
                            trip.updateStartTime(newStartTime);
                        } else {
                            trip.updateTriplegStartTime(triplegId, newStartTime);
                        }
                    }.bind(trip));
                    ui.timeline.on('end-time-change', function(triplegId, newEndTime) {
                        var tripleg = trip.getTriplegById(triplegId);
                        if(tripleg.isLast) {
                            trip.updateEndTime(newEndTime);
                        } else {
                            trip.updateTriplegEndTime(triplegId, newEndTime);
                        }
                    }.bind(trip));

                    ui.timeline.on('move-to-previous-trip', function(trip) {
                        user.getPreviousTrip(trip.getId());
                    });

                    ui.timeline.on('move-to-next-trip', function(trip) {
                        user.getNextTrip(trip.getId());
                    });

                    ui.map.init(CONFIG.map, user.id);

                    renderTrip(trip);
                    map.fitBounds(trip.mapLayer.getBounds());
                });
            });
        });
    });

    page('/statistics', function(ctx, next) {
        verifyLoggedIn(function() {
            render('views/partials/statistics.html', function() { next(); });
        });
    });

    page('/faq', function(ctx, next) {
        render('views/partials/faq.html', function() { next(); });
    });

    page('/about', function(ctx, next) {
        render('views/partials/about.html', function() { next(); });
    });

    page('/contact', function(ctx, next) {
        render('views/partials/contact.html', function() { next(); });
    });

    page({ hashbang: true });
});
