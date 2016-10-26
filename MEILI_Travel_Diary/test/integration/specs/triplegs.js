function testTriplegs() {
    describe("Triplegs", function() {

        describe("insert transition between triplegs", function() {

            it("insert transition between triplegs", function (done) {

                var timeDiff = 5 * 60 * 1000; // 5 minutes
                var tripleg = trip.getFirstTripleg();
                var numberOfTriplegsBeforeAdd = trip.triplegs.length;

                trip.insertTransitionBetweenTriplegs(
                    tripleg.getStartTime().getTime() + timeDiff,
                    tripleg.getStartTime().getTime() + (timeDiff*2),
                    tripleg.mode[0].id,
                    tripleg.mode[0].id
                ).done(function (trip) {
                    expect(trip.triplegs.length).to.be.equal(numberOfTriplegsBeforeAdd+1);
                    done();
                });
            });

            it("insert transition between triplegs should fail due to invalid start time later than end time", function (done) {

                var timeDiff = 60 * 60 * 1000; // 1hour
                var tripleg = trip.getFirstTripleg();

                trip.insertTransitionBetweenTriplegs(
                    tripleg.getStartTime().getTime() + timeDiff,
                    tripleg.getEndTime().getTime() - timeDiff,
                    tripleg.mode[0].id,
                    tripleg.mode[0].id
                ).done(function (result) {
                    done(new Error("Start time of transition should not be allowed to be later than the end time of the transition"));
                }).fail(
                    function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 400) {
                            return done(new Error("Status should be 400"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.be.equal('Start time cannot be later than end time');
                        done();
                    });
            });


            it("insert transition between triplegs should fail due to invalid parameters", function(done) {

                var timeDiff = 60*60*1000; // 1hour
                var tripleg = trip.getFirstTripleg();

                trip.insertTransitionBetweenTriplegs(
                    tripleg.getStartTime().getTime() + timeDiff,
                    tripleg.getEndTime().getTime() - timeDiff,
                    undefined,
                    null
                ).done(function(result) {
                    done(new Error("Invalid input parameters should not result in a succesfull call"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });
        });

        describe("specify transition poi", function(){

            it("the specified transition poi id should not be null", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                    null
                ).done(function(result) {
                    done(new Error("the specified transition poi id should not be allowed to be null"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("the specified transition poi id should not be undefined", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                  undefined
                ).done(function(result) {
                    done(new Error("the specified transition poi id should not be allowed to be undefined"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("the specified transition poi id should not be empty", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                    ''
                ).done(function(result) {
                    done(new Error("the specified transition poi id should not be allowed to be empty"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });


          it("the specified transition poi id should exist", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                    0
                ).done(function(result) {
                    done(new Error("the specified transition poi id should exists"));
                }).fail(
                    function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 500) {
                            return done(new Error("Status should be 500"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                        done();
                    });
            });
        });


        describe("specify the travel mode of a tripleg", function(){

            it("the specified travel mode should not be null", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    null
                ).done(function(result) {
                    done(new Error("the specified travel mode should not be allowed to be null"));
                }).fail(
                    function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 400) {
                            return done(new Error("Status should be 400"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                        done();
                    });
            });

            it("the specified travel mode should not be undefined", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    undefined
                ).done(function(result) {
                    done(new Error("the specified travel mode should not be allowed to be undefined"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("the specified travel mode should not be empty", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    ''
                ).done(function(result) {
                    done(new Error("the specified travel mode should not be allowed to be empty"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });


            it("the specified travel mode should exist", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    0
                ).done(function(result) {
                    done(new Error("the specified travel mode should exists"));
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 500) {
                        return done(new Error("Status should be 500"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                    done();
                });
            });
        });
    });
}