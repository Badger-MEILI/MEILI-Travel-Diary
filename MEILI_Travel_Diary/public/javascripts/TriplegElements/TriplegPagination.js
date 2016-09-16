/**
 * Created by adi on 2016-09-09.
 */

function getTriplegsOfTripRequest(trip_id){
        console.log('called for '+trip_id);
        var request = $.ajax({
            url: "/api/getTriplegsOfTrip",
            type: "POST",
            data: {trip_id:trip_id},
            cache: false
        });

        return request;
}