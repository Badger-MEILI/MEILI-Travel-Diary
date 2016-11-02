
function testTrips() {
    describe("Trips", function() {
        it("get last trip for user should return a trip with triplegs", function(done) {
            user.getLastTrip()
            .done(function(resTrip) {
                trip = resTrip;
                expect(trip).to.have.property("trip_id");
                expect(trip.triplegs).to.have.length.above(0);
                done();
            });
        });

        describe("trip poi specification", function() {

            it("update destination poi id should return status true", function(done) {
                trip.updateDestinationPoiIdOfTrip(
                    trip.getPlaces()[0].gid
                ).done(function (result) {
                    expect(result.status).to.be.equal(true);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("undefined destination poi id should receive server error", function(done) {
                trip.updateDestinationPoiIdOfTrip(
                    undefined
                ).done(function (result) {
                    done(new Error("a request with an undefined destination poi id should not return a successfull response"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("null destination poi id should receive server error", function(done) {
                trip.updateDestinationPoiIdOfTrip(
                    null
                ).done(function (result) {
                    done(new Error("a request with a null destination poi id should not return a successfull response"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("non existent destination poi id should receive server error", function(done) {
                trip.updateDestinationPoiIdOfTrip(
                    0
                ).done(function (result) {
                        done(new Error("a request with a non existent destination poi id should not return a successfull response"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 500)  {
                        return done(new Error("Status should be 500"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                    done();
                });
            });
        });

        describe("trip purpose specification", function() {

            it("update purpose should return status true", function(done) {
                trip.updatePurposeOfTrip(
                    trip.getPurposes()[0].id
                ).done(function (result) {
                    expect(result.status).to.be.equal(true);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("undefined purpose id should receive server error", function(done) {
                trip.updatePurposeOfTrip(
                    undefined
                ).done(function (result) {
                        done(new Error("a request with an undefined purpose id should not return a successfull response"));
                    }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 400) {
                            return done(new Error("Status should be 400"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                        done();
                    });
            });

            it("null purpose id should receive server error", function(done) {
                trip.updatePurposeOfTrip(
                    null
                ).done(function (result) {
                    done(new Error("a request with a null purpose id should not return a successfull response"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("non existent purpose id should receive server error", function(done) {
                trip.updatePurposeOfTrip(
                    0
                ).done(function (result) {
                    done(new Error("a request with a non existent purpose id should not return a successfull response"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 500) {
                        return done(new Error("Status should be 500"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                    done();
                });
            });
        });

        describe("trip time", function() {
            it("update start time of trip should update start time of trip and of first tripleg", function(done) {
                var timeDiff = 1 * 60 * 1000; // 1 minute
                var newStartTime = trip.getStartTime().getTime() - timeDiff;
                trip.updateStartTime(
                    newStartTime
                ).done(function(updatedTrip) {
                    expect(updatedTrip.getStartTime().getTime()).to.be.equal(newStartTime);
                    expect(updatedTrip.getFirstTripleg().getStartTime().getTime()).to.be.equal(newStartTime);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("update end time of trip should update end time of trip and of last tripleg", function(done) {
                var timeDiff = 1 * 60 * 1000; // 1 minute
                var newEndTime = trip.getEndTime().getTime() - timeDiff;
                trip.updateEndTime(
                    newEndTime
                ).done(function(updatedTrip) {
                    expect(updatedTrip.getEndTime().getTime()).to.be.equal(newEndTime);
                    expect(updatedTrip.getLastTripleg().getEndTime().getTime()).to.be.equal(newEndTime);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });
        });

    });
}
