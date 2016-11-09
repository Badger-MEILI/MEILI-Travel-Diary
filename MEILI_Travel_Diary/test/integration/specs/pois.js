function testPois() {
    describe("Pois", function() {

        describe("insert destination poi", function() {

            it("should be able to insert a destination poi", function (done) {
                var name = 'Test';
                var point = { lat: 59, lng: 18 };

                api.pois.insertDestinationPoi(name, point, user.id).done(function (result) {
                    expect(result.insert_destination_poi).to.not.be.null;
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("should be able to insert destination poi and set it on trip", function (done) {
                var nameToInsert = 'Test';
                var pointToInsert = { lat: 59, lng: 18 };

                // Insert new
                api.pois.insertDestinationPoi(nameToInsert, pointToInsert, user.id).done(function (result) {
                    // Set it on trip
                    trip.updateDestinationPoiIdOfTrip(result.insert_destination_poi).done(function() {
                        // Get last trip to verify
                        user.getLastTrip().done(function(updatedTrip) {

                            // Make sure trip have destinations
                            expect(updatedTrip.destination_places).to.not.be.equal(null);

                            var isOnTrip = false;
                            // loop trip to find inserted destination
                            for (var i = 0; i < updatedTrip.destination_places.length; i++) {
                                var poi = updatedTrip.destination_places[i];
                                if(poi.name === nameToInsert && poi.latitude === pointToInsert.lat && poi.longitude === pointToInsert.lng) {
                                    isOnTrip = true;
                                }
                            };
                            expect(isOnTrip).to.be.equal(true);
                            done();
                        });
                    });
                }).fail(function(err) {
                    done(err);
                });

            });

        });

        describe("insert transportation poi", function() {

            it("should be able to insert a transportation poi", function (done) {
                var name = 'Test';
                var point = { lat: 59, lng: 18 };

                api.pois.insertTransportationPoi(name, point, user.id).done(function (result) {
                    expect(result.insert_transition_poi).to.not.be.null;
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("should be able to insert transportation poi and set it on tripleg", function (done) {
                var nameToInsert = 'Test';
                var pointToInsert = { lat: 59, lng: 18 };

                // Insert new
                api.pois.insertTransportationPoi(nameToInsert, pointToInsert, user.id).done(function (result) {
                    // Set it on trip
                    trip.getFirstTripleg().updateTransitionPoiIdOfTripleg(result.insert_transition_poi).done(function() {
                        // Get last trip to verify
                        user.getLastTrip().done(function(updatedTrip) {
                            var updatedTripleg = updatedTrip.getFirstTripleg();

                            // Make sure tripleg have destinations
                            expect(updatedTripleg.places).to.not.be.equal(null);

                            var isOnTripleg = false;
                            // loop trip to find inserted destination
                            for (var i = 0; i < updatedTripleg.places.length; i++) {
                                var poi = updatedTripleg.places[i];
                                if(poi.name === nameToInsert && poi.lat === pointToInsert.lat && poi.lon === pointToInsert.lng) {
                                    isOnTripleg = true;
                                }
                            };
                            expect(isOnTripleg).to.be.equal(true);
                            done();
                        });
                    });
                }).fail(function(err) {
                    done(err);
                });
            });
        });
    });
};