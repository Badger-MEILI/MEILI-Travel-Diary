
function testTrips() {

    describe("Trips", function() {
        it("get last trip for user should return a trip with triplegs", function(done) {
            user.getLastTrip()
            .done(function(resTrip) {
                trip = resTrip;
                expect(trip).to.have.property("trip_id");
                expect(trip.triplegs).to.have.length.above(0);
                done();
            })
            .fail(function (err,f,d) {
                console.log(err,f,d);
                done(f);
            });
        });
    });

    describe("Trip poi specification", function() {

        it("undefined destination poi id should receive server error", function(done) {
            trip.updateDestinationPoiIdOfTrip(
                undefined
            ).done(function (result) {
                done(new Error("a request with an undefined destination poi id should not return a successfull response"));
            }).fail(function (jqXHR, textStatus, errorThrown) {
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
            }).fail(function (jqXHR, textStatus, errorThrown) {
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
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON.error.code != 500)  {
                    return done(new Error("Status should be 500"));
                }
                expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                done();
            });
        });
    });

    describe("Trip purpose specification", function() {

        it("undefined purpose id should receive server error", function(done) {
            trip.updatePurposeOfTrip(
                undefined
            ).done(function (result) {
                    done(new Error("a request with an undefined purpose id should not return a successfull response"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
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
            }).fail(function (jqXHR, textStatus, errorThrown) {
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
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON.error.code != 500) {
                    return done(new Error("Status should be 500"));
                }
                expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                done();
            });
        });
    });

}
