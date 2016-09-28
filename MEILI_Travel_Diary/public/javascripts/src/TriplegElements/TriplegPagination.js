/**
 * Created by adi on 2016-09-09.
 */

function getTriplegsOfTripRequest(trip_id){
        console.log('called for '+trip_id);
        var request = $.ajax({
            url: "/apiv2/triplegs/getTriplegsOfTrip",
            type: "GET",
            data: {trip_id:trip_id},
            cache: false
        });

        return request;
}