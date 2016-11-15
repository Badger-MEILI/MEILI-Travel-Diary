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
        var stack = '';
        try {
            stack = errorObj && errorObj.stack ? ' >> STACK >> ' + errorObj.stack.toString() : '';
        } catch(e) {}
        log.error('Window -> onerror', errorMsg, url, lineNumber, column, stack);
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

        // Render timeline
        ui.timeline.render(trip);

        // Render map
        ui.lmap.render(trip.generateMapLayer());
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
                ui.lmap = new LMap(CONFIG.map, user.id);
                ui.timeline = new Timeline({ elementId: 'timeline'});

                // keep track of user changing trip
                user.on('current-trip-changed', function(trip) {
                    // update number of trips left to annotate
                    user.getNumberOfTrips()
                      .done(function(result) {
                        $('#tripsLeft').html(result.rows[0].user_get_badge_trips_info);
                        $('#badge_holder').show();
                    });

                    trip.on('trip-confirm', user.confirmTrip.bind(user));
                    trip.on('trip-update', renderTrip);
                    trip.on('triplegs-update', renderTrip);
                    trip.on('split-trip', user.splitTrip.bind(user));

                    renderTrip(trip);

                    // Ugly hack to scroll timeline to top on trip change
                    ui.timeline.scrollToTop();
                });

                // Adding timeline events
                ui.timeline.on('move-to-previous-trip', user.getPreviousTrip.bind(user));
                ui.timeline.on('move-to-next-trip', user.getNextTrip.bind(user));
                ui.timeline.on('delete-trip', user.deleteTrip.bind(user));
                ui.timeline.on('merge-trip', user.mergeWithNextTrip.bind(user));
                ui.timeline.on('map-zoom-to', ui.lmap.fitBounds.bind(ui.lmap))
                ui.timeline.on('add-new-destination', function() {
                    ui.lmap.addNewPlace().then(user.addNewDestinationPoiToCurrentTrip.bind(user));
                }.bind(this));
                ui.timeline.on('add-new-transportation-poi', function(tripleg) {
                    ui.lmap.addNewPlace().then(function(name, point) {
                        user.insertTransportationPoi(name, point).then(function(result) {
                            tripleg.addTransitionPlace(result.insert_transition_poi, name, point);
                            tripleg.updateTransitionPoiIdOfTripleg(result.insert_transition_poi);
                        });
                    });
                }.bind(this));

                // Initiate by getting last trip for user and rendering it
                user.getLastTrip().done(renderTrip);
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
