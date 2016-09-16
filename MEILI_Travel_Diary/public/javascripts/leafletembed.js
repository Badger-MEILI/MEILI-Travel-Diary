/*
 MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

 Copyright (C) 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/
 Copyright (C) 2016 Badger AB - https://github.com/Badger-MEILI

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Date.prototype.format=function(e){var t="";var n=Date.replaceChars;for(var r=0;r<e.length;r++){var i=e.charAt(r);if(r-1>=0&&e.charAt(r-1)=="\\"){t+=i}else if(n[i]){t+=n[i].call(this)}else if(i!="\\"){t+=i}}return t};Date.replaceChars={shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longMonths:["January","February","March","April","May","June","July","August","September","October","November","December"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longDays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],d:function(){return(this.getDate()<10?"0":"")+this.getDate()},D:function(){return Date.replaceChars.shortDays[this.getDay()]},j:function(){return this.getDate()},l:function(){return Date.replaceChars.longDays[this.getDay()]},N:function(){return this.getDay()+1},S:function(){return this.getDate()%10==1&&this.getDate()!=11?"st":this.getDate()%10==2&&this.getDate()!=12?"nd":this.getDate()%10==3&&this.getDate()!=13?"rd":"th"},w:function(){return this.getDay()},z:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil((this-e)/864e5)},W:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil(((this-e)/864e5+e.getDay()+1)/7)},F:function(){return Date.replaceChars.longMonths[this.getMonth()]},m:function(){return(this.getMonth()<9?"0":"")+(this.getMonth()+1)},M:function(){return Date.replaceChars.shortMonths[this.getMonth()]},n:function(){return this.getMonth()+1},t:function(){var e=new Date;return(new Date(e.getFullYear(),e.getMonth(),0)).getDate()},L:function(){var e=this.getFullYear();return e%400==0||e%100!=0&&e%4==0},o:function(){var e=new Date(this.valueOf());e.setDate(e.getDate()-(this.getDay()+6)%7+3);return e.getFullYear()},Y:function(){return this.getFullYear()},y:function(){return(""+this.getFullYear()).substr(2)},a:function(){return this.getHours()<12?"am":"pm"},A:function(){return this.getHours()<12?"AM":"PM"},B:function(){return Math.floor(((this.getUTCHours()+1)%24+this.getUTCMinutes()/60+this.getUTCSeconds()/3600)*1e3/24)},g:function(){return this.getHours()%12||12},G:function(){return this.getHours()},h:function(){return((this.getHours()%12||12)<10?"0":"")+(this.getHours()%12||12)},H:function(){return(this.getHours()<10?"0":"")+this.getHours()},i:function(){return(this.getMinutes()<10?"0":"")+this.getMinutes()},s:function(){return(this.getSeconds()<10?"0":"")+this.getSeconds()},u:function(){var e=this.getMilliseconds();return(e<10?"00":e<100?"0":"")+e},e:function(){return"Not Yet Supported"},I:function(){var e=null;for(var t=0;t<12;++t){var n=new Date(this.getFullYear(),t,1);var r=n.getTimezoneOffset();if(e===null)e=r;else if(r<e){e=r;break}else if(r>e)break}return this.getTimezoneOffset()==e|0},O:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+"00"},P:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+":00"},T:function(){var e=this.getMonth();this.setMonth(0);var t=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,"$1");this.setMonth(e);return t},Z:function(){return-this.getTimezoneOffset()*60},c:function(){return this.format("Y-m-d\\TH:i:sP")},r:function(){return this.toString()},U:function(){return this.getTime()/1e3}}

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var days_sv = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var map;
var plotlayers={};
var correspondingTimeline={};
var correspondingPolyline={};
var currentTrip;
var marker={};
var newMarker = {};
var newTransitionMarker={};
//var fixedTransitionMarker={};
var fixedTransitionMarkers=[];
var draggableTransitionMarkers=[];
var pointLayerArray= [];
// end date of trip
var currentTripEndDate;
// start date of next trip
var nextTripStartDate;
var userId;

// purpose of previous trip
var previousPurpose;
// place where previous trip stopped
var previousPlace;
// end date of previous trip
var previousTripEndDate;
// start date of current trip
var currentTripStartDate;

var geojsonMarkerOptions = {
    radius: 6,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var transitionIcon = L.icon({
    iconUrl: 'images/transition.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

var stopIcon= L.icon({
    iconUrl: 'images/stop_flag.png',
    iconSize: [30, 30],
    iconAnchor: [10, 10]
});

var startIcon= L.icon({
    iconUrl: 'images/start_flag.png',
    iconSize: [30, 30],
    iconAnchor: [10, 10]
});

var editIcon= L.icon({
    iconUrl: 'images/editIcon.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

var mapMarkerIcon= L.icon({
    iconUrl: 'images/mark2.png',
    iconSize: [35, 35],
    iconAnchor: [10, 10]
});

var serverResponse = {
    "trips_to_process":"3",
    "trips":[
        {
            "tripid": "0",
            "prev_trip_stop": "none",
            "prev_trip_purpose": "none",
            "prev_trip_place": "Home",
            "next_trip_start": "2014-10-03 10:07:50",
            "destination_places": [
                {
                    "db_id": "1",
                    "longitude": "17.9878771068",
                    "latitude": "59.3548244105",
                    "name": "Home_foo",
                    "type": "home",
                    "accuracy": "100"
                }
            ],
            "purposes": [
                {
                    "id": "1",
                    "certainty": "100"
                }
            ],
            "triplegs": [
                {
                    "triplegid": "111",
                    "points": [
                        {
                            "id": "1",
                            "lat": "17.9889660095",
                            "lon": "59.354805672",
                            "time": "2014-10-03 06:11:21"
                        },
                        {
                            "id": "2",
                            "lat": "17.9878771068",
                            "lon": "59.3548244105",
                            "time": "2014-10-03 06:20:40"
                        },

                        {
                            "id": "3",
                            "lat": "17.9867827862",
                            "lon": "59.3547836972",
                            "time": "2014-10-03 06:22:00"
                        },
                        {
                            "id": "4",
                            "lat": "17.9839985979",
                            "lon": "59.354912767",
                            "time": "2014-10-03 06:27:50"
                        },
                        {
                            "id": "5",
                            "lat": "17.9839985979",
                            "lon": "59.354912767",
                            "time": "2014-10-03 06:32:50"
                        }

                    ],
                    "mode": [{"id": "2", "certainty": "100"}],
                    "places": [
                        {
                            "osm_id": "1",
                            "type": "bus station",
                            "name": "bus station name",
                            "lat": "59.35606640439245",
                            "lon": "17.986421585083008",
                            "chosen_by_user": "true"
                        }
                    ]
                },
                {
                    "triplegid": "112",
                    "points": [
                        {
                            "id": "5",
                            "lat": "17.9839985979",
                            "lon": "59.354912767",
                            "time": "2014-10-03 06:38:50"
                        },
                        {
                            "id": "17",
                            "lat": "17.98609972000122",
                            "lon": "59.35583672655769",
                            "time": "2014-10-03 06:40:32"
                        },
                        {
                            "id": "1",
                            "lat": "17.9889660095",
                            "lon": "59.354805672",
                            "time": "2014-10-03 06:51:21"
                        }
                    ],
                    "mode": [{id: "1", "certainty": "100"}],
                    "places": [
                        {}
                    ]
                }
            ]
        }
        ,
        {
    "tripid": "1",
    "prev_trip_stop": "2014-10-03 06:51:21",
    "prev_trip_purpose": "Home",
    "prev_trip_place": "Home",
    "next_trip_start": "2014-10-03 12:03:44",
    "destination_places": [
        {
            "db_id": "1",
            "longitude": "17.9889660095",
            "latitude": "59.354805672",
            "name": "Home_foo",
            "type": "home",
            "accuracy": "42"
        },
        {
            "db_id": "2",
            "latitude": "59.3562",
            "longitude": "17.9889660095",
            "name": "Work_foo",
            "type": "work",
            "accuracy": "40"
        },
        {
            "db_id": "3",
            "latitude": "59.35606640439245",
            "longitude": "17.9889660095",
            "name": "Grocery_foo",
            "type": "groceries",
            "accuracy": "3"
        }
    ],
    "purposes": [
        {
            "id": "1",
            "certainty": "70"
        },
        {
            "id": "2",
            "certainty": "20"
        },
        {
            "id": "3",
            "certainty": "10"
        }
    ],
    "triplegs": [
        {
            "triplegid": "111",
            "points": [
                {
                    "id": "1",
                    "lat": "17.9839985979",
                    "lon": "59.354912767",
                    "time": "2014-10-03 10:07:50"
                },

                {
                    "id": "3",
                    "lat": "17.9867827862",
                    "lon": "59.3547836972",
                    "time": "2014-10-03 10:10:00"
                },
                {
                    "id": "4",
                    "lat": "17.9878771068",
                    "lon": "59.3548244105",
                    "time": "2014-10-03 10:10:40"
                },
                {
                    "id": "5",
                    "lat": "17.9889660095",
                    "lon": "59.354805672",
                    "time": "2014-10-03 10:11:21"
                },
                {
                    "id": "6",
                    "lat": "17.9888086396",
                    "lon": "59.3543096027",
                    "time": "2014-10-03 10:12:02"
                },
                {
                    "id": "7",
                    "lat": "17.9886960091",
                    "lon": "59.353857706",
                    "time": "2014-10-03 10:12:42"
                },
                {
                    "id": "8",
                    "lat": "17.9878205236",
                    "lon": "59.3530903116",
                    "time": "2014-10-03 10:13:30"
                },
                {
                    "id": "9",
                    "lat": "17.9861364471",
                    "lon": "59.3537643265",
                    "time": "2014-10-03 10:13:57"
                },
                {
                    "id": "10",
                    "lat": "17.9873102918",
                    "lon": "59.3522572747",
                    "time": "2014-10-03 10:14:19"
                },
                {
                    "id": "11",
                    "lat": "17.9872301112",
                    "lon": "59.3518081723",
                    "time": "2014-10-03 10:14:59"
                },
                {
                    "id": "12",
                    "lat": "17.9868934222",
                    "lon": "59.3513875586",
                    "time": "2014-10-03 10:15:34"
                },
                {
                    "id": "13",
                    "lat": "17.986831654",
                    "lon": "59.3509383799",
                    "time": "2014-10-03 10:16:00"
                },
                {
                    "id": "14",
                    "lat": "17.986810431",
                    "lon": "59.350488871",
                    "time": "2014-10-03 10:16:47"
                },
                {
                    "id": "15",
                    "lat": "17.9870022603",
                    "lon": "59.3500280928",
                    "time": "2014-10-03 10:17:15"
                }
            ],
            "mode": [{"id": "2", "certainty": "10"},
                {"id": "1", "certainty": "80"},
                {"id": "3", "certainty": "40"}],
            "places": [
                {
                    "osm_id": "1",
                    "type": "bus station",
                    "name": "bus station name",
                    "lat": "59.3500281750",
                    "lon": "20",
                    "chosen_by_user": "false"
                }
            ]
        },
        {
            "triplegid": "112",
            "points": [
                {
                    "id": "16",
                    "lat": "17.9870022603",
                    "lon": "59.3500280928",
                    "time": "2014-10-03 10:29:58"
                },
                {
                    "id": "17",
                    "lat": "18.0247607403",
                    "lon": "59.332038104",
                    "time": "2014-10-03 10:30:32"
                }
            ],
            "mode": [{id: "1", "certainty": "10"},
                {id: "2", "certainty": "5"},
                {id: "3", "certainty": "5"}],
            "places": [
                {}
            ]
        },
        {
            "triplegid": "113",
            "points": [
                {
                    "id": "17",
                    "lat": "18.0247607403",
                    "lon": "59.332038104",
                    "time": "2014-10-03 10:33:32"
                },
                {
                    "id": "18",
                    "lat": "18.0238924365",
                    "lon": "59.3318877995",
                    "time": "2014-10-03 10:33:42"
                },
                {
                    "id": "19",
                    "lat": "18.0235373787",
                    "lon": "59.3314657408",
                    "time": "2014-10-03 10:33:53"
                },
                {
                    "id": "20",
                    "lat": "18.0239205757",
                    "lon": "59.3310021328",
                    "time": "2014-10-03 10:34:16"
                },
                {
                    "id": "21",
                    "lat": "18.023431464",
                    "lon": "59.3305972292",
                    "time": "2014-10-03 10:34:26"
                },
                {
                    "id": "22",
                    "lat": "18.0225138118",
                    "lon": "59.3298535405",
                    "time": "2014-10-03 10:34:36"
                },
                {
                    "id": "23",
                    "lat": "18.0221112496",
                    "lon": "59.3293507907",
                    "time": "2014-10-03 10:34:43"
                },
                {
                    "id": "24",
                    "lat": "18.0218154887",
                    "lon": "59.32888583",
                    "time": "2014-10-03 10:34:50"
                },
                {
                    "id": "25",
                    "lat": "18.0213126116",
                    "lon": "59.3284796408",
                    "time": "2014-10-03 10:35:02"
                },
                {
                    "id": "26",
                    "lat": "18.0214707804",
                    "lon": "59.3280196931",
                    "time": "2014-10-03 10:35:39"
                },
                {
                    "id": "27",
                    "lat": "18.0205895315",
                    "lon": "59.3281201546",
                    "time": "2014-10-03 10:36:26"
                },
                {
                    "id": "28",
                    "lat": "18.0197248825",
                    "lon": "59.3282682933",
                    "time": "2014-10-03 10:36:58"
                },
                {
                    "id": "29",
                    "lat": "18.0185444577",
                    "lon": "59.3282500063",
                    "time": "2014-10-03 10:37:16"
                }
            ],
            "mode": [{"id": "3", "certainty": "50"},
                {"id": "2", "certainty": "10"},
                {"id": "1", "certainty": "5"}],
            "places": [
                {}
            ]
        }
    ]
    },
        {
            "tripid": "2",
            "prev_trip_stop": "2014-10-03 10:37:16",
            "prev_trip_purpose": "Work",
            "prev_trip_place": "Sweco",
            "next_trip_start": "none",
            "destination_places": [
                {
                    "db_id": "1",
                    "latitude": "46",
                    "longitude": "24",
                    "name": "Home_foo",
                    "type": "home",
                    "accuracy": "42"
                },
                {
                    "db_id": "2",
                    "latitude": "46.5",
                    "longitude": "24.5",
                    "name": "Work_foo",
                    "type": "work",
                    "accuracy": "40"
                },
                {
                    "db_id": "3",
                    "latitude": "46.7",
                    "longitude": "24.9",
                    "name": "Grocery_foo",
                    "type": "groceries",
                    "accuracy": "3"
                }
            ],
            "purposes": [
                {
                    "id": "1",
                    "certainty": "70"
                },
                {
                    "id": "2",
                    "certainty": "20"
                },
                {
                    "id": "3",
                    "certainty": "10"
                }
            ],
            "triplegs": [
                {
                    "triplegid": "114",
                    "points": [
                        {
                            "id": "31",
                            "lat": "18.0185444577",
                            "lon": "59.3282500063",
                            "time": "2014-10-03 12:03:44"
                        },
                        {
                            "id": "32",
                            "lat": "18.0193347618",
                            "lon": "59.3282596803",
                            "time": "2014-10-03 12:03:46"
                        },
                        {
                            "id": "33",
                            "lat": "18.0200761989",
                            "lon": "59.3278799634",
                            "time": "2014-10-03 12:03:59"
                        },
                        {
                            "id": "34",
                            "lat": "18.0210772389",
                            "lon": "59.3279633715",
                            "time": "2014-10-03 12:04:12"
                        },
                        {
                            "id": "35",
                            "lat": "18.021934137",
                            "lon": "59.3278360833",
                            "time": "2014-10-03 12:04:47"
                        },
                        {
                            "id": "36",
                            "lat": "18.0217093976",
                            "lon": "59.3281320752",
                            "time": "2014-10-03 12:06:16"
                        }
                    ],
                    "mode": [{"id": "2", "certainty": "10"},
                        {"id": "1", "certainty": "80"},
                        {"id": "3", "certainty": "40"}],
                    "places": [
                        {
                            "osm_id": "1",
                            "type": "bus station",
                            "name": "bus station name",
                            "lat": "40",
                            "lon": "20",
                            "chosen_by_user": "false"
                        }
                    ]
                },
                {
                    "triplegid": "115",
                    "points": [
                        {
                            "id": "36",
                            "lat": "18.0217093976",
                            "lon": "59.3281320752",
                            "time": "2014-10-03 12:11:16"
                        },
                        {
                            "id": "37",
                            "lat": "18.0218831303",
                            "lon": "59.3285968764",
                            "time": "2014-10-03 12:11:41"
                        },
                        {
                            "id": "38",
                            "lat": "18.0221538056",
                            "lon": "59.329041649",
                            "time": "2014-10-03 12:11:53"
                        },
                        {
                            "id": "39",
                            "lat": "18.0246129726",
                            "lon": "59.3317722255",
                            "time": "2014-10-03 12:12:55"
                        },
                        {
                            "id": "40",
                            "lat": "18.025445655",
                            "lon": "59.332079644",
                            "time": "2014-10-03 12:13:40"
                        },
                        {
                            "id": "41",
                            "lat": "18.0263071859",
                            "lon": "59.3319412701",
                            "time": "2014-10-03 12:13:55"
                        },
                        {
                            "id": "42",
                            "lat": "18.0272600358",
                            "lon": "59.3318574578",
                            "time": "2014-10-03 12:14:07"
                        },
                        {
                            "id": "43",
                            "lat": "18.0283128191",
                            "lon": "59.3318790457",
                            "time": "2014-10-03 12:14:17"
                        },
                        {
                            "id": "44",
                            "lat": "17.9876413003",
                            "lon": "59.3494776566",
                            "time": "2014-10-03 12:26:03"
                        },
                        {
                            "id": "45",
                            "lat": "17.9868755655",
                            "lon": "59.3497094455",
                            "time": "2014-10-03 12:26:20"
                        },
                        {
                            "id": "46",
                            "lat": "17.9870419695",
                            "lon": "59.3501570048",
                            "time": "2014-10-03 12:27:13"
                        },
                        {
                            "id": "47",
                            "lat": "17.9873762021",
                            "lon": "59.3505932063",
                            "time": "2014-10-03 12:27:25"
                        },
                        {
                            "id": "48",
                            "lat": "17.9878571514",
                            "lon": "59.3511674262",
                            "time": "2014-10-03 12:27:39"
                        }
                    ],
                    "mode": [{id: "1", "certainty": "10"},
                        {id: "2", "certainty": "5"},
                        {id: "3", "certainty": "5"}],
                    "places": [
                        {}
                    ]
                },
                {
                    "triplegid": "116",
                    "points": [
                        {
                            "id": "48",
                            "lat": "17.9878571514",
                            "lon": "59.3511674262",
                            "time": "2014-10-03 12:28:00"
                        },
                        {
                            "id": "49",
                            "lat": "17.9873642993",
                            "lon": "59.3519979298",
                            "time": "2014-10-03 12:28:24"
                        },
                        {
                            "id": "50",
                            "lat": "17.9884764638",
                            "lon": "59.3528613095",
                            "time": "2014-10-03 12:29:17"
                        },
                        {
                            "id": "51",
                            "lat": "17.9878986752",
                            "lon": "59.3533182398",
                            "time": "2014-10-03 12:30:07"
                        },
                        {
                            "id": "52",
                            "lat": "17.988571292",
                            "lon": "59.3540563321",
                            "time": "2014-10-03 12:30:58"
                        },
                        {
                            "id": "53",
                            "lat": "17.9886284253",
                            "lon": "59.3540819389",
                            "time": "2014-10-03 12:30:59"
                        },
                        {
                            "id": "54",
                            "lat": "17.9890525463",
                            "lon": "59.3544865059",
                            "time": "2014-10-03 12:31:31"
                        },
                        {
                            "id": "55",
                            "lat": "17.9884326811",
                            "lon": "59.3548117862",
                            "time": "2014-10-03 12:32:19"
                        },
                        {
                            "id": "56",
                            "lat": "17.9875328212",
                            "lon": "59.3548214678",
                            "time": "2014-10-03 12:32:51"
                        },
                        {
                            "id": "57",
                            "lat": "17.9866184293",
                            "lon": "59.3548424978",
                            "time": "2014-10-03 12:33:24"
                        },
                        {
                            "id": "58",
                            "lat": "17.9857037458",
                            "lon": "59.3549069838",
                            "time": "2014-10-03 12:33:54"
                        },
                        {
                            "id": "59",
                            "lat": "17.9848121972",
                            "lon": "59.3548432403",
                            "time": "2014-10-03 12:34:28"
                        },
                        {
                            "id": "60",
                            "lat": "17.9839914855",
                            "lon": "59.3548093933",
                            "time": "2014-10-03 12:35:46"
                        }
                    ],
                    "mode": [{"id": "3", "certainty": "50"},
                        {"id": "2", "certainty": "10"},
                        {"id": "1", "certainty": "5"}],
                    "places": [
                        {}
                    ]
                }
            ]
        }
    ]
};

/**********************************************************************
 * UTILITIES ****************************************************
 *********************************************************************/

/**=============IMMEDIATE ACTIONS====================================*/


/**
 * Called once the webpage is loaded
 */
/*
var holderOfStrings=[];

function loadTranslationFiles(language){
    $.getJSON('../Translation/translation_' + language + '.json', function(json) {
        console.log(json); // this will show the info it in firebug console
    });
}

function getTranslation(string, language) {
    loadTranslationFiles(language);
}*/

function initmap(serverResp, thisUserId) {

    var injector = angular.element(document).injector();
    var aMsgHandlerService = injector.get('translationService');

    var $rootScope = injector.get('$rootScope');

    console.log(aMsgHandlerService);


    if (thisUserId==undefined){
        console.log('need login');
    }

    var badge_holder = document.getElementById('badge_holder');

    if (serverResp==null||serverResp==undefined){
        //if (getLanguage()=="en")
        alert('Please come back later, there are not enough trips to show you yet');
        //else alert('Kom tillbaka senare. Det finns inte tillräckligt med resor att visa ännu');

        var numberOfTripsBadge = document.getElementById('tripsLeft');
        numberOfTripsBadge.innerHTML = serverResponse.trips_to_process;
        badge_holder.style.visibility = "visible";
    }
    else {
        badge_holder.style.visibility = "visible";
        //if (getLanguage()=="en")
        var assistantHelper = document.getElementById('assistant');
        /*else
            var assistantHelper = document.getElementById('assistantSv');*/
        assistantHelper.style.visibility = "visible";
        assistantHelper.addEventListener("click", enablingListener);

        console.log(badge_holder);

        console.log(serverResp);
    console.log(serverResponse);
    console.log(thisUserId);

    userId = thisUserId;

    console.log(userId);

    newMarker.userId = userId;

    serverResponse = serverResp;

        var numberOfTripsBadge = document.getElementById('tripsLeft');
        numberOfTripsBadge.innerHTML = serverResponse.trips_to_process;

    enableMapScrolling();

    // set up the map
    // first un-annotated trip
    currentTrip = serverResponse.trips[serverResponse.go_to_index-1];

        console.log(currentTrip);

    generateMap();
    generateHTMLElements(currentTrip);
    }
}

function enableMapScrolling(){
    var $scrollingDiv = $(".thisone");

    var top = $scrollingDiv.offset().top;
    var width = window.innerWidth;

    /**
     * Scrolling according to http://www.wduffy.co.uk/blog/keep-element-in-view-while-scrolling-using-jquery/
     * @type {*|jQuery|HTMLElement}
     */


    $(window).scroll(function(){
        //console.log('enable scroll');
        $scrollingDiv.css('top',0);
        width = window.innerWidth;
        if (width>980){
            $scrollingDiv
                .stop()
                .animate({"marginTop": Math.min(($(window).scrollTop() ),Math.abs($('#timeline').height() - $('#map').height())+50)+ "px"}, "slow" );}
        else{
            $scrollingDiv.css('top',90);
        }
    });
}

/**
 * Populates layers - gets called on new trip only
 */

function generateMap(){
    map = new L.Map('map');

    map.options.maxZoom = 17;


    //TODO CUSTOM CODE WILL BE CHANGED
    map.setView(new L.LatLng(59.340893391583855, 18.00436019897461),12);

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 24, attribution: osmAttrib});

    var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 18
    });
    var Stamen_TonerHybrid = L.tileLayer('http://{s}.tile.stamen.com/toner-hybrid/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20
    });

    var baseMaps = {
        "OSM": osm,
        "ESRI": Esri_WorldImagery,
        "nightmode":CartoDB_DarkMatter
    };

    var overlayMaps = {
        "Roads": Stamen_TonerHybrid
    };

    map.addLayer(osm);

    integrityCheck();

    logFrontEndOperation(userId,'the map is drawn');

    L.control.layers(baseMaps, overlayMaps).addTo(map);
}

/**
 * Gets called on each new trip - calls the generation of timeline panels and draws polylines on map
 * @param currentTrip - the trip that will be drawn on the map
 */
function generateHTMLElements(currentTrip){
    var tripLegs = currentTrip.triplegs;
    generateFirstTimelineElement();
    var first = true;
    for (var i in tripLegs)
    {
        generateTimelineElement(tripLegs[i]);
        generatePolyline(tripLegs[i], map, i, first);
        first = false;
    }
    generateLastTimelineElement();

    $.when(logFrontEndOperation(userId,'the user can interact with his trips')).done(function () {;
        forceLoad();
        if (previousPurpose==null) showIntroGuide(currentTrip);
    })

}


/**
 * Function that removes a tripleg from the current trip, and from the map and timeline associated elements - usually called only on triplegs completely within a time frame
 * @param triplegid - the tripleg to be removed
 */
function removeTripleg(triplegid){

    console.log(triplegid);

    var liMeta = document.getElementById('listItem'+triplegid);

    var li = document.getElementById('telem'+triplegid);
    var liCircle = document.getElementById('telem_circle'+triplegid);
    var liPanel = document.getElementById('tldate'+triplegid);

    liMeta.remove();
  /*  li.parentNode.remove();
    li.remove();

    if (liCircle!=null) {
        liCircle.parentNode.remove();
        liCircle.remove();
    }
    if (liPanel!=null) {
        liPanel.parentNode.remove();
        liPanel.remove();
    }
    */

    for (var i in currentTrip.triplegs)
    {
        if (currentTrip.triplegs[i].triplegid==triplegid){
            /*console.log(currentTrip.triplegs);*/
            removePolylineFromMap(currentTrip.triplegs[i].triplegid,currentTrip.triplegs[i]);
            currentTrip.triplegs.splice(i,1);
            /*console.log(currentTrip.triplegs);*/
        }
    }

     console.log(currentTrip);
}

function redrawOnly(tripleg){

    console.log('redrawing '+tripleg.triplegid);

    removePolylineFromMap(tripleg.triplegid,tripleg);
    for (var j in currentTrip.triplegs)
        if (currentTrip.triplegs[j].triplegid==tripleg.triplegid)
        {
            addNewPolylineToMap(tripleg,j);
            updatePolyline(tripleg.triplegid);
        }

}

/**
 * Function that updates (array, map and  timeline) a trip leg - usually called on start and stop boundaries
 * @param tripleg - the tripleg to be updated
 */
function updateRemoveRedraw(tripleg){
    var liMeta = document.getElementById('listItem'+tripleg.triplegid);

    console.log(tripleg);

    var li = document.getElementById('telem'+tripleg.triplegid);
    var liCircle = document.getElementById('telem_circle'+tripleg.triplegid);
    var liPanel = document.getElementById('tldate'+tripleg.triplegid);

    /*console.log(liMeta);
    console.log(liMeta.childNodes);

        console.log('telem' + tripleg.triplegid);
        console.log(liMeta);
        console.log(li);
        console.log(liPanel);
*/

        if (liCircle != null) {

            liCircle.remove();

            if (liCircle.parentNode != null)
                liCircle.parentNode.remove();
        }

        if (liPanel != null) {
            liPanel.remove();
            /*if (liPanel.parentNode != null) liPanel.parentNode.remove();*/
        }



    var html = getTimelineElementContent(tripleg);

    if(getTransitionPanel(tripleg.triplegid)!=undefined)
        html+= getTransitionPanel(tripleg.triplegid);

    html+= generateModal(tripleg.triplegid);

    liMeta.innerHTML = html;
    liMeta.id = 'listItem'+tripleg.triplegid;

/*    console.log(li.childNodes);
    console.log(liMeta.childNodes);
    for (var j=1; j<liMeta.childNodes.length; j++) {
        if (liMeta.childNodes[j] != undefined) {
            //console.log(liMeta.childNodes[1]);
            liMeta.childNodes[j].outerHTML = "";
        }
    }

    var skipFirstNode = true;
    for (var j=1; j<li.childNodes.length; j++) {
        if (li.childNodes[j] != undefined) {
            if (li.childNodes[j].nodeName=="li")
                if (!skipFirstNode){
                    li.childNodes[j].outerHTML = "";
                }
            skipFirstNode=false;
            //console.log(liMeta.childNodes[1]);
        }
    }
*/
    // console.log(html);

    addTimelineListeners(tripleg);

    removePolylineFromMap(tripleg.triplegid,tripleg);

    for (var j in currentTrip.triplegs)
        if (currentTrip.triplegs[j].triplegid==tripleg.triplegid)
        {
            addNewPolylineToMap(tripleg,j);
            updatePolyline(tripleg.triplegid);
        }

    $('html, body').animate({
        scrollTop: $('#telem'+tripleg.triplegid).offset().top-60
    }, 'slow');
}



function clusterEndPoint(trip){

    var passiveTripIndex = getNextPassiveTrip(trip.tripid);

    if (serverResponse.trips[passiveTripIndex]!=undefined)
    {
        var cluster_point = {};
        cluster_point.lat = 0;
        cluster_point.lon = 0;

        for (var j in serverResponse.trips[passiveTripIndex].triplegs[0].points){
            console.log('adding to lat '+serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lat);
            cluster_point.lat = cluster_point.lat + serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lat;
            console.log(' summed lat '+cluster_point.lat);

            console.log('adding to lon '+serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lon);
            cluster_point.lon = cluster_point.lon + serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lon;
            console.log(' summed lon '+cluster_point.lon);
        }

        cluster_point.lat = cluster_point.lat / serverResponse.trips[passiveTripIndex].triplegs[0].points.length;
        cluster_point.lon = cluster_point.lon / serverResponse.trips[passiveTripIndex].triplegs[0].points.length;

    }

    console.log('clustered end point for trip '+trip.tripid);
    console.log(cluster_point);

    return cluster_point;
}

function clusterStartPoint(trip){

    var passiveTripIndex = getPrevPassiveTrip(trip.tripid);
    console.log(passiveTripIndex);

    console.log(serverResponse.trips[passiveTripIndex]);

    if (serverResponse.trips[passiveTripIndex]!=undefined)
    {
        var cluster_point = {};
        cluster_point.lat = 0;
        cluster_point.lon = 0;

        for (var j in serverResponse.trips[passiveTripIndex].triplegs[0].points){
            console.log('adding to lat '+serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lat);
            cluster_point.lat = cluster_point.lat + serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lat;
            console.log(' summed lat '+cluster_point.lat);

            console.log('adding to lon '+serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lon);
            cluster_point.lon = cluster_point.lon + serverResponse.trips[passiveTripIndex].triplegs[0].points[j].lon;
            console.log(' summed lon '+cluster_point.lon);
        }

        cluster_point.lat = cluster_point.lat / serverResponse.trips[passiveTripIndex].triplegs[0].points.length;
        cluster_point.lon = cluster_point.lon / serverResponse.trips[passiveTripIndex].triplegs[0].points.length;

    }

    console.log('clustered start point for trip '+trip.tripid);
    console.log(cluster_point);

    return cluster_point;

}

function checkCurrentTrip(){

    currentTrip.purposes.sort(comparePurpose);
    currentTrip.destination_places.sort(comparePlace);

    if (currentTrip.purposes[0].accuracy<=50) {
        console.log('failed purpose test '+currentTrip.purposes[0].accuracy);
        return false;
    }
    if (currentTrip.destination_places[0].accuracy<=50) {
        console.log('failed destination places test '+ (currentTrip.destination_places[0].accuracy<=50));
        return false;
    }

    var copyOfTriplegs = [];

    for (var i in currentTrip.triplegs){
        copyOfTriplegs.push(jQuery.extend(true, {} , currentTrip.triplegs[i]));
        if (currentTrip.triplegs[i].type_of_tripleg==1){
            currentTrip.triplegs[i].mode.sort(compare);
            // console.log(currentTrip.triplegs[i].mode[0]);
        if (currentTrip.triplegs[i].mode[0].certainty<=50) {
            console.log('failed tripleg '+currentTrip.triplegs[i].triplegid+' test '+currentTrip.triplegs[i].mode[0].certainty);
            return false;
        }
        }
    }


    var i;
    var j = copyOfTriplegs.length;
    console.log(copyOfTriplegs);
    console.log('number of trips needed '+j);
    for (i = 0; i < j; i++) {

        (function(){
            pushTriplegModification(null,copyOfTriplegs[i],"upsert", currentTrip.tripid);
            console.log('just pushed '+copyOfTriplegs[i].triplegid);
        }

        )(i);
        /*(function(cntr) {
            // here the value of i was passed into as the argument cntr
            // and will be captured in this function closure so each
            // iteration of the loop can have it's own value
            var request = pushTriplegModification(null,copyOfTriplegs[cntr],"upsert", currentTrip.tripid);

        })(i);*/
    }


    return true;
}



/**
 * Marks the current trip as processed and brings the next trip for processing. Commits the updates of the current trip on to the next trip.
 */
function nextFunction(){


        $.when(logFrontEndOperation(userId, 'getNextTrip Before Response').done(function() {
            try{
                if (checkCurrentTrip()){
                window.scroll(0, 0);

                var ul = document.getElementById("timeline");

                ul.innerHTML="";



                var tripIndex = getNextTrip(currentTrip.tripid);

                var passiveTripIndex = getNextPassiveTrip(currentTrip.tripid);

                currentTrip.purposes.sort(comparePurpose);
                currentTrip.destination_places.sort(comparePlace);

                serverResponse.trips[tripIndex].prev_trip_stop = currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time;
                serverResponse.trips[tripIndex].prev_trip_purpose = currentTrip.purposes[0].id;
                serverResponse.trips[tripIndex].prev_trip_place = currentTrip.destination_places[0].osm_id;
                serverResponse.trips[tripIndex].prev_trip_place_name = currentTrip.destination_places[0].name;

                console.log(tripIndex);
                currentTrip = serverResponse.trips[tripIndex];
                var clusteredStartPoint = clusterStartPoint(currentTrip);

              //  serverResponse[currentTrip.tripid] = currentTrip;

                getNextTripAndAttachToResponse(serverResponse, userId, clusteredStartPoint );


            }
            else {
                    //if (getLanguage()=="en")
                    alert('Please fill in all the required fields');
                    /*else
                        alert('Fyll i alla obligatoriska fält');*/
                }
    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }
        }));
}

function nextFunctionAfterResponse(clusteredStartPoint ){


        $.when(logFrontEndOperation(userId,'getNext After Response').done(function(){
            try {
            var clusteredEndPoint = clusterEndPoint(currentTrip);

            if (clusteredStartPoint!=undefined){
                currentTrip.triplegs[0].points[0].lat = clusteredStartPoint.lat;
                currentTrip.triplegs[0].points[0].lon = clusteredStartPoint.lon;
            }

            if (clusteredEndPoint!=undefined){
                currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].lat = clusteredEndPoint.lat;
                currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].lon = clusteredEndPoint.lon;
            }

            nextTripStartDate = new Date(undefined);
            previousTripEndDate= new Date(undefined);

            serverResponse.trips_to_process--;

            var numberOfTripsBadge = document.getElementById('tripsLeft');
            numberOfTripsBadge.innerHTML = serverResponse.trips_to_process;

            var ul = document.getElementById("timeline");

            ul.innerHTML = "";

            map.remove();
            generateMap();

            console.log(currentTrip);
            generateHTMLElements(currentTrip);
    }
    catch (exception){
        logError(userId, exception,serverResponse);
    }
        }));
}

/**
 * Retrieves the previously ANNOTATED trip - interaction still possible
 */
function previousFunction(){

        $.when(logFrontEndOperation(userId,'getPrevious Before Response').done(function(){
            try {

        var ul = document.getElementById("timeline");

        ul.innerHTML = "";

        console.log(serverResponse);
        console.log(currentTrip);

        getPrevTripAndAttachToResponse(serverResponse, userId);

    }
    catch(exception){
        logError(userId,exception,serverResponse);
    }
        }));
}

function previousFunctionAfterAnswer(){


        $.when(logFrontEndOperation(userId, 'getPrevious After Answer').done(function(){
            try{
            var tripIndex = getPrevTrip(currentTrip.tripid);

            // serverResponse[currentTrip.tripid] = currentTrip;
            console.log(tripIndex);
            // (if tripIndex>=0)

            serverResponse.trips[tripIndex].next_trip_start = currentTrip.triplegs[0].points[0].time;

            currentTrip = serverResponse.trips[tripIndex];
            var clusteredStartPoint = clusterStartPoint(currentTrip);
            var clusteredEndPoint = clusterEndPoint(currentTrip);


            if (clusteredStartPoint!=undefined){
            currentTrip.triplegs[0].points[0].lat = clusteredStartPoint.lat;
            currentTrip.triplegs[0].points[0].lon = clusteredStartPoint.lon;
            }

            if (clusteredEndPoint!=undefined){
            currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].lat = clusteredEndPoint.lat;
            currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].llon  = clusteredEndPoint.lon;
            }

            serverResponse.trips_to_process++;

            var numberOfTripsBadge = document.getElementById('tripsLeft');
            numberOfTripsBadge.innerHTML = serverResponse.trips_to_process;

            map.remove();
            generateMap();

            console.log(currentTrip);
            generateHTMLElements(currentTrip);

            window.scroll(0, 0);
    }
    catch (exception){
        console.log('caught exception');
        logError(userId,exception,serverResponse);
    }
        }));
}

/**=========================TEMPORAL ASPECTS AND RULES==========================*/

/**
 * Gets elements that might affect temporal integrity
 * @param initialTime - proposed initial time
 * @param endTime - proposed end time
 * @param tripleg - the tripleg with which the user interacted to perform the changes
 * @param prevInitialTime - previous initial time
 * @param prevEndTime - previous end time
 */
function checkTemporalConsequences(initialTime, endTime, tripleg, prevInitialTime,prevEndTime){
    console.log('Passed temporal consequences');

    console.log('initial '+initialTime);
    console.log('end '+endTime);
    console.log('prevInitial '+prevInitialTime);
    console.log('prevEnd '+prevEndTime);

    console.log('Getting the triplegs completely within initialTime and endTime');
    var triplegsInside = getAllTripLegsCompletelyWithin(initialTime, endTime,tripleg.triplegid);

    console.log(triplegsInside);

    console.log('Getting boundaries - one sided temporal intersects initialTime and endTime');
    var startBoundary = getBoundaries(initialTime, endTime)[0];
    var stopBoundary = getBoundaries(initialTime, endTime)[1];


    console.log(startBoundary);
    console.log(stopBoundary);

    if (startBoundary==undefined) startBoundary=tripleg;
    if (stopBoundary==undefined) stopBoundary=tripleg;

    console.log(startBoundary);
    console.log(stopBoundary);

    if (triplegsInside.length==0)
    {
        if (startBoundary.triplegid!=stopBoundary.triplegid){
            // no triplegs to delete, only overlapping triplegs - inform user that he will modify the stopBoundary to a certain time
            showAndAddDataForModal(tripleg, initialTime, endTime, startBoundary, stopBoundary);
        }
        else
        {
            //pushUpdates
            tripleg.points[tripleg.points.length-1].time = endTime.toString();
            tripleg.points[0].time = initialTime.toString();
            updateTransitionPanel(tripleg.triplegid);
            /*console.log(tripleg);*/
        }
        // else do nothing - regular case
    }
    else{
        // there are overlapping trip legs
        showAndAddDataForLongModal(tripleg, initialTime, endTime, startBoundary, stopBoundary, triplegsInside);
    }
}

/**
 * Short modal occurring only when there are no triplegs that are completely within the suggested time frame
 * @param tripleg - the tripleg that triggered the change
 * @param initialTime - proposed initial time
 * @param endTime - proposed end time
 * @param startBoundary - left side overlap of time frame
 * @param stopBoundary - right side overlap of time frame
 */
function showAndAddDataForModal(tripleg, initialTime, endTime, startBoundary, stopBoundary, triplegStartDate, triplegEndDate){
    console.log('short modal');

    $('#transitionAlertModal').data('triplegId',tripleg.triplegid);
    $('#transitionAlertModal').data('prevInitialTime',initialTime);
    $('#transitionAlertModal').data('prevEndTime',endTime);
    $('#transitionAlertModal').data('startBoundary',startBoundary);
    $('#transitionAlertModal').data('stopBoundary',stopBoundary);

    $('#transitionAlertModal').data('formerStart',triplegStartDate);
    $('#transitionAlertModal').data('formerEnd',triplegEndDate);

    var ul = document.getElementById('modalList');
    var paragraphInform = document.getElementById('transitionParagraphInform');
    var paragraphAlert = document.getElementById('transitionParagraphAlert');

    ul.innerHTML='';
    paragraphAlert.innerHTML='';
    paragraphInform.innerHTML='';
    paragraphAlert.style.display='none';
    ul.style.display = 'none';

    //shift towards the previous
    if (tripleg.triplegid!=startBoundary.triplegid && tripleg.triplegid==stopBoundary.triplegid)
        paragraphInform.innerHTML = 'Your modifications will shift the previous tripleg to '+ getPointFormatedDate(new Date(initialTime));
    /*{
        if (getLanguage()=="en")
            paragraphInform.innerHTML = 'Your modifications will shift the previous tripleg to '+ getPointFormatedDate(new Date(initialTime));
        else
            paragraphInform.innerHTML = 'Dina justeringar kommer att medföra att din föregående förflyttning justeras till '+ getPointFormatedDate(new Date(initialTime));
    }*/
    else
    {
        //shift towards the next
        paragraphInform.innerHTML = 'Your modifications will shift the next tripleg to '+getPointFormatedDate(new Date(endTime));
        /*if (getLanguage()=="en")

        else
            paragraphInform.innerHTML = 'Dina justeringar kommer att medföra att din nästa förflyttning justeras till '+getPointFormatedDate(new Date(endTime));*/
    }
    $('#transitionAlertModal').modal('show');
}

/**
 * Long modal occuring when there are triplegs completely within the suggested time frame
 * @param tripleg - the tripleg that triggered the change
 * @param initialTime - proposed initial time
 * @param endTime - proposed end time
 * @param startBoundary - left side overlap of time frame
 * @param stopBoundary - right side overlap of time frame
 * @param triplegsInside - an array containing all  the trip legs completely within initial time and end time
 */
function showAndAddDataForLongModal(tripleg, initialTime, endTime, startBoundary, stopBoundary, triplegsInside, backupTrip, backupTripleg){
    var language = getLanguage();
//    console.log('chosen language is');

    console.log('long modal');
    $('#transitionAlertModal').data('triplegId',tripleg.triplegid);
    $('#transitionAlertModal').data('prevInitialTime',initialTime);
    $('#transitionAlertModal').data('prevEndTime',endTime);
    $('#transitionAlertModal').data('startBoundary',startBoundary);
    $('#transitionAlertModal').data('stopBoundary',stopBoundary);
    $('#transitionAlertModal').data('triplegsInside',triplegsInside);
    $('#transitionAlertModal').data('backupTrip',backupTrip);
    $('#transitionAlertModal').data('backupTripleg',backupTripleg);

    var ul = document.getElementById('modalList');
    var paragraphInform = document.getElementById('transitionParagraphInform');
    var paragraphAlert = document.getElementById('transitionParagraphAlert');

    ul.innerHTML='';
    paragraphAlert.innerHTML='';
    paragraphInform.innerHTML='';
    paragraphAlert.style.display='none';
    ul.style.display = 'none';

    if (startBoundary.triplegid != stopBoundary.triplegid || triplegsInside.length!=currentTrip.triplegs.length-1) //overwrites a tripleg
    {
        if (tripleg.triplegid!=startBoundary.triplegid && tripleg.triplegid!=stopBoundary.triplegid)
        {
            //if (getLanguage()=="en")
                paragraphInform.innerHTML = 'The modified tripleg will shift its previous trip leg to '+ getPointFormatedDate(new Date(tripleg.points[0].time))+ ' and its next trip leg to '+getPointFormatedDate(new Date(tripleg.points[tripleg.points.length-1].time));
            /*else
                paragraphInform.innerHTML = 'Dina justeringar kommer att medföra att din nästa till '+ getPointFormatedDate(new Date(tripleg.points[0].time))+ ' och kommande förflyttning justeras till '+getPointFormatedDate(new Date(tripleg.points[tripleg.points.length-1].time));*/
        }
        else
        if (tripleg.triplegid!=startBoundary.triplegid && tripleg.triplegid==stopBoundary.triplegid)
        {
            //if (getLanguage()=="en")
                paragraphInform.innerHTML = 'Your modifications will shift the previous tripleg to '+ getPointFormatedDate(new Date(initialTime));
            /*else
                paragraphInform.innerHTML = 'Dina justeringar kommer att medföra att din föregående förflyttning justeras till '+ getPointFormatedDate(new Date(initialTime));*/
        }
        else if (tripleg.triplegid==startBoundary.triplegid && tripleg.triplegid!=stopBoundary.triplegid)
        {
            //if (getLanguage()=="en")
                paragraphInform.innerHTML = 'Your modifications will shift the next tripleg to '+ getPointFormatedDate(new Date(endTime));
            /*else
                paragraphInform.innerHTML = 'Dina justeringar kommer att medföra att din nästa förflyttning justeras till '+ getPointFormatedDate(new Date(endTime));*/
        }


        if (triplegsInside.length!=0)
        {
            paragraphAlert.style.display='inline';
            ul.style.display = 'inline';
            //if (getLanguage()=="en")
                paragraphAlert.innerHTML='You will delete the following trip legs:';
            /*else
                paragraphAlert.innerHTML='Du tar nu bort dessa förflyttningar:';*/
        }

        console.log(triplegsInside);

        for (var i in triplegsInside)
        {
            triplegsInside[i].mode.sort(compare);
            var li = document.createElement("li");
            if (getLanguage()=="en")
            li.innerHTML = '<li>Tripleg by: '+getMode(triplegsInside[i].mode[0].id)+' from '+getPointFormatedDate(new Date(triplegsInside[i].points[0].time))+' to '+ getPointFormatedDate(new Date(triplegsInside[i].points[triplegsInside[i].points.length-1].time))+'</li>';
            /*else
                li.innerHTML = '<li>Förflyttning med: '+getMode(triplegsInside[i].mode[0].id)+' från '+getPointFormatedDate(new Date(triplegsInside[i].points[0].time))+' till '+ getPointFormatedDate(new Date(triplegsInside[i].points[triplegsInside[i].points.length-1].time))+'</li>';*/
            ul.appendChild(li);
        }

    }
    else
    {
        //if (getLanguage()=="en")
            paragraphInform.innerHTML = 'You will delete all the other triplegs in the trip';
        /*else
            paragraphInform.innerHTML = 'Du tar nu bort alla andra förflyttningar inom denna resa';*/
    }

    $('#transitionAlertModal').modal('show');

}

function showShortModal(backupTrip,trip,backupTripleg, tripleg, startBoundary, stopBoundary, newStartTime, newEndTime, triplegsInside){
    console.log('short modal');

    $('#transitionAlertModal').data('originalTripleg',tripleg);
    $('#transitionAlertModal').data('backupTrip',backupTrip);
    $('#transitionAlertModal').data('modifiedTripleg',backupTripleg);
    //$('#transitionAlertModal').data('prevEndTime',endTime);
    $('#transitionAlertModal').data('startBoundary',startBoundary);
    $('#transitionAlertModal').data('stopBoundary',stopBoundary);
    $('#transitionAlertModal').data('newStartTime',newStartTime);
    $('#transitionAlertModal').data('newEndTime',newEndTime);


    console.log(triplegsInside);

    //$('#transitionAlertModal').data('formerStart',triplegStartDate);
    //$('#transitionAlertModal').data('formerEnd',triplegEndDate);

    var ul = document.getElementById('modalList');
    var paragraphInform = document.getElementById('transitionParagraphInform');
    var paragraphAlert = document.getElementById('transitionParagraphAlert');

    ul.innerHTML='';
    paragraphAlert.innerHTML='';
    paragraphInform.innerHTML='';
    paragraphAlert.style.display='none';
    ul.style.display = 'none';

    //shift towards the previous
    if (backupTripleg.triplegid!=backupTripleg.triplegid && backupTripleg.triplegid==backupTripleg.triplegid)
    {
        paragraphInform.innerHTML = 'The modified tripleg will shift its previous trip leg to '+ getPointFormatedDate(new Date(newStartTime));
    }
    else
    {
        //shift towards the next
        paragraphInform.innerHTML = 'The modified tripleg will shift its next trip leg to '+getPointFormatedDate(new Date(newEndTime));
    }

    if (triplegsInside.length!=0){
        paragraphAlert.style.display='inline';
        ul.style.display = 'inline';
        paragraphAlert.innerHTML='You will delete the following trip legs:';
    for (var i in triplegsInside)
    {
        triplegsInside[i].mode.sort(compare);
        var li = document.createElement("li");
        li.innerHTML = '<li>The tripleg travelled by '+getMode(triplegsInside[i].mode[0].id)+' from '+ getPointFormatedDate(new Date(triplegsInside[i].points[0].time))+' to '+ getPointFormatedDate(new Date(triplegsInside[i].points[triplegsInside[i].points.length-1].time))+'</li>';
        ul.appendChild(li);
    }
    }

    $('#transitionAlertModal').modal('show');
}

function showAndAddDataForLongModalV2(tripleg, startTime, endTime, startBoundary, stopBoundary, triplegsInside, triplegStartDate, triplegEndDate){
    console.log('long modal');
    $('#transitionAlertModal').data('triplegId',tripleg.triplegid);
    $('#transitionAlertModal').data('prevInitialTime',startTime);
    $('#transitionAlertModal').data('prevEndTime',endTime);
    $('#transitionAlertModal').data('startBoundary',startBoundary);
    $('#transitionAlertModal').data('stopBoundary',stopBoundary);
    $('#transitionAlertModal').data('triplegsInside',triplegsInside);
    $('#transitionAlertModal').data('formerStart',triplegStartDate);
    $('#transitionAlertModal').data('formerEnd',triplegEndDate);

    var ul = document.getElementById('modalList');
    var paragraphInform = document.getElementById('transitionParagraphInform');
    var paragraphAlert = document.getElementById('transitionParagraphAlert');

    ul.innerHTML='';
    paragraphAlert.innerHTML='';
    paragraphInform.innerHTML='';
    paragraphAlert.style.display='none';
    ul.style.display = 'none';

    if (startBoundary.triplegid != stopBoundary.triplegid || triplegsInside.length!=currentTrip.triplegs.length-1) //overwrites a tripleg
    {
        console.log(startBoundary);
        console.log(stopBoundary);
        if (startBoundary.triplegid==undefined) paragraphInform.innerHTML = 'The modified tripleg will shift its next trip leg to '+ getPointFormatedDate(new Date(endTime));
        if (stopBoundary.triplegid==undefined) paragraphInform.innerHTML = 'The modified tripleg will shift its previous trip leg to '+ getPointFormatedDate(new Date(startTime));
        /*if (tripleg.triplegid!=startBoundary.triplegid && tripleg.triplegid!=stopBoundary.triplegid)
            paragraphInform.innerHTML = 'You will insert a new trip leg that will shift its previous trip leg to '+tripleg.points[0].time+ ' and its next trip leg to '+tripleg.points[tripleg.points.length-1].time;
        else
        if (tripleg.triplegid!=startBoundary.triplegid && tripleg.triplegid==stopBoundary.triplegid)
            paragraphInform.innerHTML = 'You will insert a new trip leg that will shift its previous trip leg to '+initialTime;
        else if (tripleg.triplegid==startBoundary.triplegid && tripleg.triplegid!=stopBoundary.triplegid)
            paragraphInform.innerHTML = 'You will insert a new trip leg that will shift its next trip leg to '+endTime;
        */

        console.log(triplegsInside);
        if (triplegsInside.length!=0)
        {
            paragraphAlert.style.display='inline';
            ul.style.display = 'inline';
            paragraphAlert.innerHTML='You will delete the following trip legs:';
        }

        console.log(triplegsInside);

        for (var i in triplegsInside)
        {
            triplegsInside[i].mode.sort(compare);
            var li = document.createElement("li");
            li.innerHTML = '<li>The tripleg travelled by '+getMode(triplegsInside[i].mode[0].id)+' from '+ getPointFormatedDate(new Date(triplegsInside[i].points[0].time))+' to '+ getPointFormatedDate(new Date(triplegsInside[i].points[triplegsInside[i].points.length-1].time))+'</li>';
            ul.appendChild(li);
        }

    }
    else
    {
        paragraphInform.innerHTML = 'You will delete all the other trip legs in the trip';
    }

    $('#transitionAlertModal').modal('show');

}

/**
 * Function called when the user accepts the consequences of his changes
 * @param data
 */

function performChanges(data){

    $.when(logFrontEndOperation(userId, 'performing all changes on the transition').done(function(){

    var backupTrip = $('#transitionAlertModal').data('backupTrip');

    for (var i in currentTrip.triplegs){
        var exists = false;
        for (var j in backupTrip.triplegs){
            // TODO
            // check which triplegs have been modified and act on the modification -> IF it doesn't exist, then delete, if it exists and it is different then update
            if (backupTrip.triplegs[j].triplegid == currentTrip.triplegs[i].triplegid){
                // exists
                exists=true;
                /*var same = true;
                    // compare the tripleg characteristics

                // first point difference
                if (backupTrip.triplegs[j].points[0].id!=currentTrip.triplegs[i].points[0].id) same = false;
                if (new Date(backupTrip.triplegs[j].points[0].time).valueOf()!=new Date(currentTrip.triplegs[i].points[0].time).valueOf) same = false;

                // last point difference
                if (backupTrip.triplegs[j].points[backupTrip.triplegs[j].points.length-1].id!=currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].id) same = false;
                if (new Date(backupTrip.triplegs[j].points[0].time).valueOf()!=new Date(currentTrip.triplegs[0].points[0].time).valueOf) same = false;*/
            }

            // if not exists -> throw away
            try{
            if (!exists) pushTriplegModification(null, currentTrip.triplegs[i], 'delete', currentTrip.tripid);
            else pushTriplegModification(null, currentTrip.triplegs[i], 'upsert', currentTrip.tripid);
            }
            catch (exception){
                logError(userId,exception,serverResponse);
            }
        }
    }

    try {
        pushTripModification(currentTrip, backupTrip, "update");
    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }

    currentTrip = backupTrip;

    map.remove();
    generateMap();

    var ul = document.getElementById("timeline");

    ul.innerHTML="";

    generateHTMLElements(currentTrip);
  /*  console.log(data);

    console.log("performing changes");

    var originalTripleg = $('#transitionAlertModal').data('originalTripleg');
    var backedupTripleg= $('#transitionAlertModal').data('modifiedTripleg');
    var stopBoundary = $('#transitionAlertModal').data('stopBoundary');
    var startBoundary = $('#transitionAlertModal').data('startBoundary');

    var newStartTime = $('#transitionAlertModal').data('newStartTime');
    var newEndTime = $('#transitionAlertModal').data('newEndTime');

    var triplegsInside = $('#transitionAlertModal').data('triplegsInside');

    console.log(stopBoundary);

    *//*if (startBoundary.triplegid==modifiedTripleg) {
        console.log('modifying all to the right');
        //add all to the end of startBoundary (go through all trips inside ASCENDING AND stopBoundary) until reaching proposed endTime and then split stopBoundary

        if (triplegsInside != null) {
            console.log('triplegs inside not null');
            for (var i = 0; i < triplegsInside.length; i++) {
                console.log("TRIPLEG");
                for (var j = 0; j < triplegsInside[i].points.length; j++) {
                    startBoundary.points.push(triplegsInside[i].points[j]);
                    console.log("Point");
                }
            }
        }
        else {
            console.log('triplegs inside is null');
        }

        for (var x = 0; x < stopBoundary.points.length; x++) {

            var compareDate = new Date(stopBoundary.points[x].time);
            var proposedDate = new Date(proposedEndTime);

            console.log("compare date " + compareDate);
            console.log("proposed date " + proposedDate);

            if (compareDate <= proposedDate) {
                startBoundary.points.push(stopBoundary.points[x]);

                console.log("length before splice " + stopBoundary.points.length);
                stopBoundary.points.splice(x, 1);
                console.log("length after splice " + stopBoundary.points.length);

                //console.log(stopBoundary.points);
                console.log("x is " + x);
                x--;
            }

            console.log("x " + x);

        }

        if (stopBoundary.points.length != 0) {

        var point = new Object();

        point.id = stopBoundary.points[0].id;
        point.lat = stopBoundary.points[0].lat;
        point.lon = stopBoundary.points[0].lon;
        point.time = proposedEndTime;

        startBoundary.points.push(point);
        stopBoundary.points[0].time = proposedEndTime;
        }
    *//**//*startBoundary.points[startBoundary.points.length-1].time = proposedEndTime;*//**//*

        console.log(startBoundary);
        console.log(stopBoundary);
    }
    else
    {
        console.log('modifying all to the left');
        //add all to the beginning of stopBoundary (go through all trips inside DESCENDING AND startBoundary) until reaching proposed initialTime and then split startBoundary

        if (triplegsInside!=null){
            for (var i=triplegsInside.length-1;i>=0;i--){
                for (var j=triplegsInside[i].points.length-1; j>=0;j--){
                    stopBoundary.points.unshift(triplegsInside[i].points[j]);
                }
            }
        }


        for (var x=startBoundary.points.length-1; x>=0; x--){

            var compareDate = new Date(startBoundary.points[x].time);
            var proposedDate = new Date(proposedInitialTime);


            if (compareDate>=proposedDate){
                console.log('inside');
                stopBoundary.points.unshift(startBoundary.points[x]);
                startBoundary.points.splice(x,1);
            }
        }

        var point = new Object();

        console.log(startBoundary);
        point.id = startBoundary.points[startBoundary.points.length-1].id;
        point.lat = startBoundary.points[startBoundary.points.length-1].lat;
        point.lon = startBoundary.points[startBoundary.points.length-1].lon;
        point.time = proposedInitialTime;

        stopBoundary.points.unshift(point);

        startBoundary.points[startBoundary.points.length-1].time = proposedInitialTime;
        *//**//*stopBoundary.points[0].time = proposedInitialTime;*//**//*

        console.log(startBoundary);
        console.log(stopBoundary);
    }*//*


        for (var i in triplegsInside) {
            console.log("removing tripleg " + triplegsInside[i].triplegid);
            removeTripleg(triplegsInside[i].triplegid);
        }
    *//*
    else {
        for (var i in triplegsInside) {
            console.log("removing tripleg " + triplegsInside[i].triplegid);
            removeTripleg(triplegsInside[i].triplegid);
        }
    }*//*



    if (startBoundary.triplegid!=undefined || jQuery.isEmptyObject(startBoundary)){
        // only start modification
        addPointsWithinTriplegsToTriplegBefore(startBoundary, triplegsInside, originalTripleg.triplegid);
        movePointsBeforeBoundary(startBoundary, newStartTime, originalTripleg.triplegid);
      //  console.log(startBoundary);
        if (startBoundary.points.length>1)
            updateRemoveRedraw(startBoundary);
        // else implies that it is the only trip
        else updateTransitionPanel(currentTrip.triplegs[0].triplegid);
    }

    if (stopBoundary.triplegid!=undefined || jQuery.isEmptyObject(stopBoundary)){
        addPointsWithinTriplegsToTriplegAfter(stopBoundary, triplegsInside, originalTripleg.triplegid);
        movePointsAfterBoundary(stopBoundary, newEndTime, originalTripleg.triplegid);
    //    console.log(stopBoundary);
        if (stopBoundary.points.length>1)
        updateRemoveRedraw(stopBoundary);
        // else implies that it is the only trip
        else {
            //updateRemoveRedraw(currentTrip.triplegs[0]);
            updateTransitionPanel(currentTrip.triplegs[0].triplegid);
        }
    }
*/
    //console.log(currentTrip);

    $('#transitionAlertModal').data('triplegId',null);
    $('#transitionAlertModal').data('prevInitialTime',null);
    $('#transitionAlertModal').data('prevEndTime',null);
    $('#transitionAlertModal').data('startBoundary',null);
    $('#transitionAlertModal').data('stopBoundary',null);
    $('#transitionAlertModal').data('triplegsInside',null);
    $('#transitionAlertModal').data('formerStart', null);
    $('#transitionAlertModal').data('formerEnd',null);

    $('#transitionAlertModal').modal('hide');
    }));
}


/**
 * Dismisses the updates of a time frame due to user request
 * @param data
 */
    function cancelAllChanges(data){

    $.when(logFrontEndOperation(userId, 'cancel tripleg changes').done(function(){
        console.log('done with frontend log');
    }));

    /*console.log(data);
    console.log(data.formerStart);
    console.log(data.formerEnd);


    console.log(currentTrip);

    console.log('CANCELLING DATA');
    var triplegId = $('#transitionAlertModal').data('triplegId');

    $('#transitionAlertModal').modal('hide');

    for (var i in currentTrip.triplegs)
    {
        if (triplegId==currentTrip.triplegs[i].triplegid){

            currentTrip.triplegs[i].points[0].time = data.formerStart;
            currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].time=data.formerEnd;

            console.log('found trip');
            var prevEnd = new Date(currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].time);
            var prevInit = new Date(currentTrip.triplegs[i].points[0].time);
            console.log(prevEnd);
            console.log(prevInit);
            $('#timepickerstop'+triplegId).timepicker('setTime',prevEnd.getHours()+":"+prevEnd.getMinutes());
            $('#timepickerstart'+triplegId).timepicker('setTime',prevInit.getHours()+":"+prevInit.getMinutes());

            movePointsToTempArray(currentTrip.triplegs[i], null, data.formerStart, data.formerEnd, data.formerEnd);
            movePointsToTempArray(currentTrip.triplegs[i], data.formerStart, data.formerStart, null, data.formerEnd);

            //updateRemoveRedraw(currentTrip.triplegs[i]);

            console.log(currentTrip);
           *//*if (i==currentTrip.triplegs.length-1) currentTripEndDate = prevEnd;*//*
        }
    }


    $('#transitionAlertModal').data('triplegId',null);
    $('#transitionAlertModal').data('prevInitialTime',null);
    $('#transitionAlertModal').data('prevEndTime',null);
    $('#transitionAlertModal').data('startBoundary',null);
    $('#transitionAlertModal').data('stopBoundary',null);
    $('#transitionAlertModal').data('triplegsInside',null);
    $('#transitionAlertModal').data('formerStart', null);
    $('#transitionAlertModal').data('formerEnd',null);*/
}

/**
 * Generates all the trips that fall in between a proposed initial time and end time
 * @param initialTime - the proposed initial time
 * @param endTime - the proposed end time
 * @param triplegid - the tripleg id with which the user interracted
 * @returns {Array} - array of triplegs completely within initial time and end time
 */
function getAllTripLegsCompletelyWithin(initialTime, endTime, triplegid){
    var arrayOfTriplegsInside =[];
    for (var i in currentTrip.triplegs){
        if (currentTrip.triplegs[i].triplegid!=triplegid)
        {
            var triplegStartTime = new Date(currentTrip.triplegs[i].points[0].time);
            var triplegEndTime = new Date (currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].time);
            if (triplegStartTime.getTime()>initialTime.getTime() && triplegEndTime.getTime()<endTime.getTime())
                arrayOfTriplegsInside.push(currentTrip.triplegs[i]);
        }
    }
    return arrayOfTriplegsInside;
}

/**
 * Generates the boundaries of a time frame, to verify which trip legs need be shifted to accomodate the change
 * @param initialTime - the proposed initial time
 * @param endTime - the proposed end time
 * @returns {Array} - array, where first element is the tripleg to the left margin of the timeframe and the second element is the tripleg to the right margin of the timeframe
 */
function getBoundaries(initialTime, endTime){
    var boundaries = [];
    /*    var currentTripleg={};*/

    var firstID = -1;
    var secondID = -1;

    console.log(initialTime);
    console.log(endTime);
    for (var i in currentTrip.triplegs){
        var triplegStartTime = new Date(currentTrip.triplegs[i].points[0].time);
        var triplegEndTime = new Date (currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].time);

    //    console.log(triplegStartTime);
    //    console.log(triplegEndTime);

        if (triplegStartTime.getTime()<=initialTime.getTime() && triplegEndTime.getTime()<=endTime.getTime() && triplegEndTime.getTime()>=initialTime.getTime())
        {

            console.log(triplegStartTime);
            console.log(initialTime);
            console.log(triplegEndTime);
            console.log(endTime);

            boundaries[0] = currentTrip.triplegs[i];
            firstID = parseInt(i);
        }

  //      console.log(triplegStartTime+" >= "+ initialTime+ " and "+ triplegEndTime+" >= "+endTime+" and "+triplegStartTime+" <= "+endTime);

        if (triplegStartTime.getTime()>=initialTime.getTime() && triplegEndTime.getTime()>=endTime.getTime() && triplegStartTime.getTime()<=endTime.getTime())
        {

            console.log(triplegStartTime);
            console.log(initialTime);
            console.log(triplegEndTime);
            console.log(endTime);

            secondID = parseInt(i);
            boundaries[1] = currentTrip.triplegs[i];
        }

        /*   if (triplegStartTime.getTime()==initialTime.getTime()&&triplegEndTime.getTime()==endTime.getTime()) currentTripleg=currentTrip.triplegs[i];*/
    }

   // if (boundaries[0]==undefined) boundaries[0]=currentTripleg;
   //  if (boundaries[1]==undefined) boundaries[1]=currentTripleg;

    if ((firstID != -1) || (secondID!=-1)) {
        if (firstID == -1) boundaries[0] = currentTrip.triplegs[secondID - 1];
        if (secondID == -1) boundaries[1] = currentTrip.triplegs[firstID + 1];
    }

    console.log(boundaries);

    return boundaries;
}

/**
 * Starts temporal integrity check, which reflects in changing all elements that fall within the check
 * @param fromDate - start time of new transition
 * @param toDate - end time of new transition
 * @param triplegStartDate - start date of trip leg from which the transition was called
 * @param triplegEndDate - end date of trip leg from which the transition was called
 * @param id - id of trip leg from which the transition was called
 */
function checkTemporalIntegrityRules(fromDate, toDate, triplegStartDate, triplegEndDate, id){
    /*RULE 1: Always within the current trip*/
    if (fromDate<triplegStartDate|| toDate>triplegEndDate){
        /*OUTSIDE OF THE CURRENT TRIP's TIME FRAME*/
        $('#timepickerStartTransition'+id).timepicker('setTime',triplegStartDate.getHours()+":"+triplegStartDate.getMinutes());
        $('#timepickerStopTransition'+id).timepicker('setTime',triplegEndDate.getHours()+":"+triplegEndDate.getMinutes());
        //if (getLanguage()=="en")
            alert ('Modifications are allowed only within the current tripleg\'s time frame');
        /*else
            alert ('Justering är bara tillåten inom ramen för den aktuella förflyttningens tidsperiod');*/
    }
    else
    {
        if (fromDate>toDate) {
            /*Impossible case*/
            console.log(fromDate);
            console.log(toDate);
            $('#timepickerStartTransition').timepicker('setTime',triplegStartDate.getHours()+":"+triplegStartDate.getMinutes());
            $('#timepickerStopTransition').timepicker('setTime',triplegEndDate.getHours()+":"+triplegEndDate.getMinutes());
            fromDate=triplegStartDate;
            toDate=triplegEndDate;
            //if (getLanguage()=="en")
                alert ('Start of the transfer cannot be later than the end of the transfer');
            /*else
                alert ('Starttiden för bytet kan inte vara senare än sluttiden ');*/
        }
        else
        {
            //check if it needs to be splitted
            if (toDate.getTime()!=triplegEndDate.getTime() || fromDate.getTime()!=triplegStartDate.getTime())
            {
                return true;
            }
        }
    }
}

/**
 * Filter that checks whether the temporal integrity rules are respected
 * @param id - tripleg id
 */
function requestTimeConfirmation(id){
    $('#transitionChoiceModal'+id).modal('hide');
    var id = $('#transitionChoiceModal'+id).data('id');
    var fromDate = $('#transitionChoiceModal'+id).data('fromTime');
    var toDate = $('#transitionChoiceModal'+id).data('toTime');
    var triplegStartDate = $('#transitionChoiceModal'+id).data('triplegStartDate');
    var triplegEndDate = $('#transitionChoiceModal'+id).data('triplegEndDate');
    var modeFrom = $('#transitionChoiceModal'+id).data('modeFrom');
    var modeTo = $('#transitionChoiceModal'+id).data('modeTo');

    if (checkTemporalIntegrityRules(fromDate, toDate, triplegStartDate, triplegEndDate, id))
        splitTripLeg(id, new Date(fromDate).getTime(), new Date(toDate).getTime(), triplegStartDate, triplegEndDate, modeFrom, modeTo);
}

/**
 * Splits a tripleg into two based on the temporal frame specified by a user
 * @param id - id of the tripleg to be split
 * @param fromDate - proposed end time
 * @param toDate - proposed initial time
 * @param triplegStartDate - the start time of the trip leg
 * @param triplegEndDate - the end time of the trip leg
 * @param modeFrom - mode of the first tripleg
 * @param modeTo - mode of the second tripleg
 */
function splitTripLeg(id, fromDate, toDate, triplegStartDate, triplegEndDate, modeFrom, modeTo){

    // Splitting previous tripleg into two trip legs -> CAUTION : MIGHT HAVE NO POINTS IN BETWEEN TO DRAW A LINE


    console.log(fromDate);
    console.log(toDate);
    console.log(modeFrom);
    console.log(modeTo);


    var tripLegA ={};
    tripLegA.triplegid=id+'a';
    tripLegA.points=[];
    tripLegA.places=[];


    var tripLegPassive ={};
    tripLegPassive.triplegid=id+'p';
    tripLegPassive.points=[];
    tripLegPassive.places=[];


    var tripLegB ={};
    tripLegB.triplegid=id+'b';
    tripLegB.points=[];
    tripLegB.places=[];

    var pushed=false;
    var tripLegIndex=0;

    console.log(currentTrip);
    for (var i=0; i<currentTrip.triplegs.length;i++){
        if (currentTrip.triplegs[i].triplegid ==id){
            tripLegIndex=i;
            for (var j=0; j<currentTrip.triplegs[i].points.length;j++){

                console.log(new Date(currentTrip.triplegs[i].points[j].time).format("Y-m-d H:i:s")+'<='+fromDate+' is '+(new Date(currentTrip.triplegs[i].points[j].time)<=fromDate));

                if (currentTrip.triplegs[i].points[j].time <=fromDate)
                {
                    var point = new Object();

                    point.id = currentTrip.triplegs[i].points[j].id;
                    point.lat = currentTrip.triplegs[i].points[j].lat;
                    point.lon = currentTrip.triplegs[i].points[j].lon;
                    point.time = currentTrip.triplegs[i].points[j].time;

                    tripLegA.points.push(point);
                }

                if (currentTrip.triplegs[i].points[j].time>=fromDate &&currentTrip.triplegs[i].points[j].time<=toDate){
                    var point = new Object();

                    point.id = currentTrip.triplegs[i].points[j].id;
                    point.lat = currentTrip.triplegs[i].points[j].lat;
                    point.lon = currentTrip.triplegs[i].points[j].lon;
                    point.time = currentTrip.triplegs[i].points[j].time;
                    tripLegPassive.points.push(point);
                }

                 console.log(new Date(currentTrip.triplegs[i].points[j].time).format("Y-m-d H:i:s")+'>='+toDate+' is '+(new Date(currentTrip.triplegs[i].points[j].time).format("Y-m-d H:i:s")>=toDate));


                if (currentTrip.triplegs[i].points[j].time>=toDate){

                     if (!pushed){
                        // the last geometry of A will be the first geometry of B with the timestamp of tpdate


                        var point = new Object();

                         if (tripLegPassive.points.length!=0){
                        point.id = tripLegPassive.points[tripLegPassive.points.length-1].id;
                        point.lat = tripLegPassive.points[tripLegPassive.points.length-1].lat;
                        point.lon = tripLegPassive.points[tripLegPassive.points.length-1].lon;
                        }else {
                             point.id = tripLegA.points[tripLegA.points.length-1].id;
                             point.lat = tripLegA.points[tripLegA.points.length-1].lat;
                             point.lon = tripLegA.points[tripLegA.points.length-1].lon;
                         }

                        // TODO CONTIUNE FROM HERE
                        point.time = toDate;

                        tripLegB.points.push(point);

                        pushed =  true;
                    }

                    var point = new Object();

                    point.id = currentTrip.triplegs[i].points[j].id;
                    point.lat = currentTrip.triplegs[i].points[j].lat;
                    point.lon = currentTrip.triplegs[i].points[j].lon;
                    point.time = currentTrip.triplegs[i].points[j].time;

                    tripLegB.points.push(point);
                }
            }
        }
    }

    tripLegA.defined_by_user = currentTrip.triplegs[tripLegIndex].defined_by_user;

        console.log(fromDate);
    console.log(toDate);
    // the last geometry of A will have the timestamp of fromData
    // tripLegA.points[tripLegA.points.length-1].time = fromDate;

    tripLegPassive.places = [];
    tripLegPassive.places[0] ={};
    tripLegPassive.mode = [];
    tripLegPassive.mode[0]={};

    tripLegA.points[tripLegA.points.length-1].time = fromDate;


    /*if (tripLegA.points[tripLegA.points.length-1].id != tripLegB.points[0].id){
        tripLegPassive.points[0] = tripLegA.points[tripLegA.length-1];
        tripLegPassive.points[1] = tripLegB.points[0];
    }
    else */

//    if (tripLegPassive.points.length==0) tripLegPassive.points[0] = tripLegB.points[0];

    tripLegA.places = [];
    tripLegA.places[0] ={};

    tripLegA.mode = [];
    if (modeFrom!=undefined)
    {tripLegA.mode[0]={};
    tripLegA.mode[0].id = modeFrom;
    tripLegA.mode[0].certainty ="100";
    tripLegA.mode[0].name = getMode(modeFrom);}
    tripLegA.mode = tripLegA.mode.concat(getRestOfModes(modeFrom));

    tripLegB.mode = [];
    if (modeTo!=undefined){
    tripLegB.mode[0]={};
    tripLegB.mode[0].id = modeTo;
    tripLegB.mode[0].certainty ="100";
        tripLegB.mode[0].name = getMode(modeTo);}
    tripLegB.mode = tripLegB.mode.concat(getRestOfModes(modeTo));

    tripLegB.places = [];
    tripLegB.places[0] ={};

    tripLegA.type_of_tripleg = 1;
    tripLegB.type_of_tripleg = 1;
    tripLegPassive.type_of_tripleg = 0;

    // TODO PUSH TRIPLEG CHANGE

    console.log(tripLegA);
    console.log(tripLegB);
    console.log(tripLegPassive);

    tripLegA.defined_by_user=undefined;
    tripLegB.defined_by_user=undefined;
    tripLegPassive.defined_by_user=undefined;


    if (tripLegPassive.points.length==0){
        tripLegPassive.points.push(tripLegA.points[tripLegA.points.length-1], tripLegB.points[0]);
    }
    var deleteTripleg = {};
    deleteTripleg.triplegid = id;

    console.log('deleting trip '+id);
    var requestPre = pushTriplegModification(null,deleteTripleg,'delete',currentTrip.triplegid);

    $.when(requestPre).done(function () {
        var request1 = pushTriplegModification(null, tripLegA, 'upsert', currentTrip.tripid);
        $.when(request1).done(function () {
            var request2 = pushTriplegModification(null, tripLegPassive, 'upsert', currentTrip.tripid);
            $.when(request2).done(function () {
                var request3 = pushTriplegModification(null, tripLegB, 'upsert', currentTrip.tripid);
                $.when(request3).done(function () {
                    pushTripModification(null, currentTrip, 'upsert');
                    pushChangesToHTML(id, tripLegA, tripLegB, tripLegPassive, tripLegIndex);
                });
            });
        });
    });
}

function deleteTripModal(){
    $.when(logFrontEndOperation(userId,'clicked on delete trip glyphicon').done(function(){
    $('#deleteTripModal').modal('show');
    }));
}

function mergeTripModal(){
    $.when(logFrontEndOperation(userId,'clicked on merge trips glyphicon').done(function(){
    $('#mergeTripModal').modal('show');
    }));
}
function deleteTrip(){

    $.when(logFrontEndOperation(userId,'decided to delete trip').done(function(){

    var prevTrip = serverResponse.trips[getPrevPassiveTrip(currentTrip.tripid)];

    var nextTrip = serverResponse.trips[getNextPassiveTrip(currentTrip.tripid)];
        nextTrip.type_of_trip = 0;
    var nextActualTrip = serverResponse.trips[getNextTrip(currentTrip.tripid)];
    var prevActualTrip = serverResponse.trips[getPrevTrip(currentTrip.tripid)];

    if (prevTrip!=undefined){
        prevTrip.type_of_trip = 0;
    for (var i=0; i<currentTrip.triplegs.length;i++){
        for (var j=0; j<currentTrip.triplegs[i].points.length;j++){
            prevTrip.triplegs[0].points.push(currentTrip.triplegs[i].points[j]);
        }
    }

    for (var i=0; i<nextTrip.triplegs[0].points.length;i++){
        prevTrip.triplegs[0].points.push(nextTrip.triplegs[0].points[i]);
    }

        console.log(prevActualTrip);

        nextActualTrip.prev_trip_stop = prevTrip.triplegs[0].points[0].time;
        nextActualTrip.prev_trip_purpose = prevActualTrip.purposes[0].id;
        nextActualTrip.prev_trip_place= prevActualTrip.destination_places[0].osm_id;
        nextActualTrip.prev_trip_place_name = prevActualTrip.destination_places[0].name;

        prevActualTrip.next_trip_start = nextActualTrip.triplegs[0].points[0].time;

        serverResponse.trips.splice(getPrevPassiveTrip(currentTrip.tripid),3,prevTrip);
        // request 1 - delete main trip
        var request1 = pushTripModification(null, currentTrip, "delete");

        $.when(request1).done(function (){
            // request 2 - delete next passive trip
            var request2 = pushTripModification(null, nextTrip,"delete");
            $.when(request2).done(function (){
                // request 3 - update prev passive
                var request3 = pushTripModification(null, prevTrip,"upsert");
                $.when(request3).done(function (){
                    // request 4 - update prev trip next trip prev attributes
                   var request4 = pushTripModification(null, prevActualTrip, "upsert");
                    $.when(request4).done(function (){
                        // request 5 - update next trip prev trip next attributes
                        var request5 = pushTripModification(null, nextActualTrip, "upsert");
                        $.when(request5).done(function (){
                            var request6 = getNextTripAndAttachToResponse(serverResponse,userId);
                        })
                    });
                });
            });
        });


    }

    else {
        // TODO THIS HAS TO BE DISABLED FOR THE LAST TRIP

        // FIRST TRIP ONLY

        // request 1 - delete main trip
        // request 2 - delete next passive
        // request 3 - update next trip prev attributes
        serverResponse.trips.splice(getNextPassiveTrip(currentTrip.tripid)-1,2);

        nextActualTrip.prev_trip_place = null;
        nextActualTrip.prev_trip_place_name = "";
        nextActualTrip.prev_trip_purpose = null;
        nextActualTrip.prev_trip_stop = null;

        map.remove();
        generateMap();

        var ul = document.getElementById("timeline");
        ul.innerHTML="";

        currentTrip = nextActualTrip;

        generateHTMLElements(currentTrip);

        var request1 = pushTripModification(null, currentTrip, "delete");

        $.when(request1).done(function (){
            // request 2 - delete next passive trip
            var request2 = pushTripModification(null, nextTrip,"delete");
            $.when(request2).done(function (){
                 // request 5 - update next trip prev trip next attributes
                 var request5 = pushTripModification(null, nextActualTrip, "upsert");
            });
        });
    }



    serverResponse.trips_to_process--;

    var numberOfTripsBadge = document.getElementById('tripsLeft');
    numberOfTripsBadge.innerHTML = serverResponse.trips_to_process;

    currentTrip = nextActualTrip;

    console.log(serverResponse);
    console.log(currentTrip);


    }));
}

/**===================OTHER=============*/

/**
 * Maps the id to the name of the purpose
 * @param id - the id of the purpose
 * @returns {string} - the name associated with the id
 */
function getNameOfPurpose(id){

    var newObject = {};

    if (id == 1) newObject.name = 'Travel to work'; newObject.name_sv = 'Resa till arbete';
    if (id == 2) newObject.name = 'Travel to school'; newObject.name_sv = 'Resa till skola';
    if (id == 3) newObject.name = 'Business travel'; newObject.name_sv = 'Resa i tjänsten';
    if (id == 4) newObject.name = 'Restaurant/Café'; newObject.name_sv = 'Restaurang/Café';
    if (id == 5) newObject.name = 'Leisure travel (e.g. go to cinema, theater)'; newObject.name_sv = 'Nöje (t ex bio, teater)';
    if (id == 6) newObject.name = 'Sport/hobby related travel'; newObject.name_sv = 'Motion/friluftsliv';
    if (id == 7) newObject.name = 'Food/grocery shopping'; newObject.name_sv = 'Inköp av livsmedel';
    if (id == 8) newObject.name = 'Non-food shopping'; newObject.name_sv = 'Annat inköp';
    if (id == 9) newObject.name = 'Personal business (e.g. medical visit, bank, cutting hair)'; newObject.name_sv = 'Service (t ex vårdcentral, bank, frisör)';
    if (id == 10) newObject.name = 'Visit relatives and friends'; newObject.name_sv = 'Besöka släkt och vänner';
    if (id == 11) newObject.name = 'Pick-up or drop-off children/other persons'; newObject.name_sv = 'Hämta eller lämna barn/annan person';
    if (id == 12) newObject.name = 'Return home'; newObject.name_sv = 'Åter till bostaden';
    if (id == 13) newObject.name = 'Other (incl. walk/travel without specific purpose)'; newObject.name_sv = 'Annat/övrigt (inkl. resa utan ärende)';

    return newObject.name;
}

function getNameOfPurposeSwedish(id){

    var newObject = {};

    if (id == 1) {newObject.name = 'Travel to work'; newObject.name_sv = 'Resa till arbete';}
    if (id == 2) {newObject.name = 'Travel to school'; newObject.name_sv = 'Resa till skola';}
    if (id == 3) {newObject.name = 'Business travel'; newObject.name_sv = 'Resa i tjänsten';}
    if (id == 4) {newObject.name = 'Restaurant/Café'; newObject.name_sv = 'Restaurang/Café';}
    if (id == 5) {newObject.name = 'Leisure travel (e.g. go to cinema, theater)'; newObject.name_sv = 'Nöje (t ex bio, teater)';}
    if (id == 6) {newObject.name = 'Sport/hobby related travel'; newObject.name_sv = 'Motion/friluftsliv';}
    if (id == 7) {newObject.name = 'Food/grocery shopping'; newObject.name_sv = 'Inköp av livsmedel';}
    if (id == 8) {newObject.name = 'Non-food shopping'; newObject.name_sv = 'Annat inköp';}
    if (id == 9) {newObject.name = 'Personal business (e.g. medical visit, bank, cutting hair)'; newObject.name_sv = 'Service (t ex vårdcentral, bank, frisör)';}
    if (id == 10) {newObject.name = 'Visit relatives and friends'; newObject.name_sv = 'Besöka släkt och vänner';}
    if (id == 11) {newObject.name = 'Pick-up or drop-off children/other persons'; newObject.name_sv = 'Hämta eller lämna barn/annan person';}
    if (id == 12) {newObject.name = 'Return home'; newObject.name_sv = 'Åter till bostaden';}
    if (id == 13) {newObject.name = 'Other (incl. walk/travel without specific purpose)'; newObject.name_sv = 'Annat/övrigt (inkl. resa utan ärende)';}

    return newObject.name_sv;
}

/**
 * Compares two objects by a custom field - used for sort operations on arrays of objects
 * @param a - first object
 * @param b - second object
 * @returns {number} - number representing order
 */
function comparePlace(a,b) {
    if (a.accuracy < b.accuracy)
        return 1;
    if (a.accuracy > b.accuracy)
        return -1;

    if (a.name > b.name)
        return 1;
    else return -1;
}

/**
 * Compares two objects by a custom field - used for sort operations on arrays of objects
 * @param a - first object
 * @param b - second object
 * @returns {number} - number representing order
 */
function comparePurpose(a,b) {
    if (a.accuracy< b.accuracy)
        return 1;
    if (a.accuracy > b.accuracy)
        return -1;

    if (getNameOfPurpose(a.id) > getNameOfPurpose(b.id))
    return 1;
    else return -1;
}

/**
 * Compares two arrays based on the certainty of the elements embedded in them
 * @param a - first array
 * @param b - second array
 * @returns {number} - indicator as to where the element's position should be as reported to the other element
 */
function compare(a,b) {
    if (a.certainty < b.certainty) {
        return 1;
    }

    if (a.certainty > b.certainty)
    {
        return -1;
    }

    if (a.name> b.name)
    return 1;

    return -1;
}


/**
 * Computes the transition time to the next tripleg element
 * @param triplegid - the id of the tripleg from which the transition time will be computed
 * @returns {string|string} - the outerHTML of a paragraph that contains the transition time in minutes
 */

function getTransitionTime(triplegid){

    /*var returnPar= '<p>Transition time: '+getTransitionTime(tripleg.triplegid)+' <span class="glyphicon glyphicon-edit" style="float: right;"></span></p>';*/

    for (var i=0; i<currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == triplegid) {
            console.log(i);
            console.log(currentTrip.triplegs.length - 1);
            console.log(currentTrip.triplegs);
            if (i == currentTrip.triplegs.length - 1) {
                var endDate = new Date(currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length - 1].time);
                /*var returnPar = '<p>Trip ended: ' + currentTripEndDate.getHours()+':'+currentTripEndDate.getMinutes() + ' <span class="glyphicon glyphicon-edit" style="float: right;"></span></p>';*/
                var returnPar='';
            }
            else {
                console.log(currentTrip.triplegs);
                console.log(i);
                console.log(i+2);
                var dateFrom = new Date(currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length - 1].time);
                var dateTo = new Date(currentTrip.triplegs[i+2].points[0].time);

                console.log(dateFrom);
                console.log(dateTo);
                var timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
                console.log(timeDiff);
                var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
                console.log(minutesDiff);

                //if (getLanguage()=="en")
                    var returnPar = '<p id="transitiontime'+triplegid+'">Transfer time: ' + minutesDiff + ' min <span class="glyphicon glyphicon-trash" style="float: right;" onclick="mergeWithNext(\''+triplegid+'\')"></span></p>';
                /*else
                    var returnPar = '<p id="transitiontime'+triplegid+'">Bytestid: ' + minutesDiff + ' minuter <span class="glyphicon glyphicon-trash" style="float: right;" onclick="mergeWithNext(\''+triplegid+'\')"></span></p>';
                console.log(returnPar);*/
            }
        }
    }
    return returnPar;
}

/**
 * Computes the distance in kilometers of a tripleg and returns it as a string
 * @param triplegid - the id of the tripleg for which the distance has to be computed
 * @returns {string} - the distance in kilometers as a string
 */

function getDistanceOfTripLeg(triplegid){
    //TODO change this to reflect values in meters too
    var initDist = 0;
    var prevPoint = L.latLng(0,0);
    for (var i=0; i<currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == triplegid){
            for (var j=0;j<currentTrip.triplegs[i].points.length;j++){
                var derivedPoint = L.latLng(currentTrip.triplegs[i].points[j].lon,currentTrip.triplegs[i].points[j].lat);
                if (prevPoint.lat!=0){
                    initDist = initDist+ derivedPoint.distanceTo(prevPoint);
                }
                prevPoint.lat = derivedPoint.lat;
                prevPoint.lng = derivedPoint.lng;
            }
        }
    }
    var distance;
    if (initDist<1000) distance= (Math.round(initDist/100)*100)+' m';
    else distance = Math.round(initDist/1000) +' km';
    return distance;
}

/**
 * Maps a mode id to a mode name
 * @param id - id of the mode
 * @returns {string} - name of mode associated to id
 */
function getMode(id){

        var newObject = {};
        newObject.id=id;
        newObject.certainty="0";
        if (id == 1) newObject.name = 'Walk'; newObject.name_sv = 'Till fots';
        if (id == 2) newObject.name = 'Bicycle'; newObject.name_sv = 'Cykel';
        if (id == 3) newObject.name = 'Moped / Motorcycle'; newObject.name_sv = 'Moped / Mc';
        if (id == 4) newObject.name = 'Car as driver'; newObject.name_sv = 'Bil som förare';
        if (id == 5) newObject.name = 'Car as passenger'; newObject.name_sv = 'Bil som passagerare';
        if (id == 6) newObject.name = 'Taxi'; newObject.name_sv = 'Taxi';
        if (id == 7) newObject.name = 'Paratransit'; newObject.name_sv = 'Färdtjänst';
        if (id == 8) newObject.name = 'Bus'; newObject.name_sv = 'Buss';
        if (id == 9) newObject.name = 'Subway'; newObject.name_sv = 'Tunnelbana';
        if (id == 10) newObject.name = 'Tram'; newObject.name_sv = 'Spårvagn';
        if (id == 11) newObject.name = 'Commuter train'; newObject.name_sv = 'Pendeltåg';
        if (id == 12) newObject.name = 'Train'; newObject.name_sv = 'Tåg';
        if (id == 13) newObject.name = 'Ferryboat'; newObject.name_sv = 'Färja / båt';
        if (id == 14) newObject.name = 'Flight'; newObject.name_sv = 'Flyg';
        if (id == 15) newObject.name = 'Other'; newObject.name_sv = 'Övrigt';

        return newObject.name;
}

function getModeSwedish(id){

    var newObject = {};
    newObject.id=id;
    newObject.certainty="0";
    if (id == 1) {newObject.name = 'Walk'; newObject.name_sv = 'Till fots';}
    if (id == 2) {newObject.name = 'Bicycle'; newObject.name_sv = 'Cykel';}
    if (id == 3) {newObject.name = 'Moped / Motorcycle'; newObject.name_sv = 'Moped / Mc';}
    if (id == 4) {newObject.name = 'Car as driver'; newObject.name_sv = 'Bil som förare';}
    if (id == 5) {newObject.name = 'Car as passenger'; newObject.name_sv = 'Bil som passagerare';}
    if (id == 6) {newObject.name = 'Taxi'; newObject.name_sv = 'Taxi';}
    if (id == 7) {newObject.name = 'Paratransit'; newObject.name_sv = 'Färdtjänst';}
    if (id == 8) {newObject.name = 'Bus'; newObject.name_sv = 'Buss';}
    if (id == 9) {newObject.name = 'Subway'; newObject.name_sv = 'Tunnelbana';}
    if (id == 10) {newObject.name = 'Tram'; newObject.name_sv = 'Spårvagn';}
    if (id == 11) {newObject.name = 'Commuter train'; newObject.name_sv = 'Pendeltåg';}
    if (id == 12) {newObject.name = 'Train'; newObject.name_sv = 'Tåg';}
    if (id == 13) {newObject.name = 'Ferryboat'; newObject.name_sv = 'Färja / båt';}
    if (id == 14) {newObject.name = 'Flight'; newObject.name_sv = 'Flyg';}
    if (id == 15) {newObject.name = 'Other'; newObject.name_sv = 'Övrigt';}

    return newObject.name_sv;
}

/**
 * Generates a foo array that contains all modes besides one, with a certainty of 0
 * @param id - id of the mode to be avoided
 * @returns {Array} - the array of modes
 */
function getRestOfModes(id){
    var modesArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    var returnArray=[];
    for (var i in modesArray){
   //     console.log(id +' ' +modesArray[i]);
        if (id!=modesArray[i]){
            var newObject = {};
            newObject.id=modesArray[i];
            newObject.certainty="0";
            if (modesArray[i] == 1) newObject.name = 'Walk'; newObject.name_sv = 'Till fots';
            if (modesArray[i] == 2) newObject.name = 'Bicycle'; newObject.name_sv = 'Cykel';
            if (modesArray[i] == 3) newObject.name = 'Moped / Motorcycle'; newObject.name_sv = 'Moped / Mc';
            if (modesArray[i] == 4) newObject.name = 'Car as driver'; newObject.name_sv = 'Bil som förare';
            if (modesArray[i] == 5) newObject.name = 'Car as passenger'; newObject.name_sv = 'Bil som passagerare';
            if (modesArray[i] == 6) newObject.name = 'Taxi'; newObject.name_sv = 'Taxi';
            if (modesArray[i] == 7) newObject.name = 'Paratransit'; newObject.name_sv = 'Färdtjänst';
            if (modesArray[i] == 8) newObject.name = 'Bus'; newObject.name_sv = 'Buss';
            if (modesArray[i] == 9) newObject.name = 'Subway'; newObject.name_sv = 'Tunnelbana';
            if (modesArray[i] == 10) newObject.name = 'Tram'; newObject.name_sv = 'Spårvagn';
            if (modesArray[i] == 11) newObject.name = 'Commuter train'; newObject.name_sv = 'Pendeltåg';
            if (modesArray[i] == 12) newObject.name = 'Train'; newObject.name_sv = 'Tåg';
            if (modesArray[i] == 13) newObject.name = 'Ferryboat'; newObject.name_sv = 'Färja / båt';
            if (modesArray[i] == 14) newObject.name = 'Flight'; newObject.name_sv = 'Flyg';
            if (modesArray[i] == 15) newObject.name = 'Other'; newObject.name_sv = 'Övrigt';


            returnArray.push(newObject);
        }
    }
    return returnArray;
}

/**
 * Given a mode, returns its associated colour
 * @param mode - mode id
 * @returns {*} - red for below certainty inferences, colour id for other
 */
function getColor(mode){
    mode.sort(compare);

    console.log(mode[0]);

    if (mode[0].certainty<50){
        return 'red';
    }
    else {
        return getColorById(mode[0].id);
    }
}

/**
 * Given a mode id, returns its associated colour
 * @param newMode - mode id
 * @returns {string} - colour
 */
function getColorById(newMode){
    console.log(newMode);
    if (newMode==1) return 'rgb(31,120,180)';
    if (newMode==2) return 'rgb(106,61,154)';
    if (newMode==3) return 'rgb(240,2,127)';
    if (newMode==4) return 'rgb(128,0,0)';
    if (newMode==5) return 'rgb(128,128,0)';
    if (newMode==6) return 'rgb(0,128,0)';
    if (newMode==7) return 'rgb(128,0,128)';
    if (newMode==8) return 'rgb(0,128,128)';
    if (newMode==9) return 'rgb(0,0,128)';
    if (newMode==10) return 'rgb(102,205,170)';
    if (newMode==11) return 'rgb(0,255,255)';
    if (newMode==12) return 'rgb(25,25,112)';
    if (newMode==13) return 'rgb(138,43,226)';
    if (newMode==14) return 'rgb(218,112,214)';
    if (newMode==15) return 'rgb(244,164,96)';
    return 'black';
}


/**
 * Distance from point to line
 * @param x - point lat
 * @param y - point lon
 * @param x1 - line point 1 lat
 * @param y1 - line point 1 lon
 * @param x2 - line point 2 lat
 * @param y2 - line point 2 lon
 * @returns {number} - distance between point and line
 */
function pDistance(x, y, x1, y1, x2, y2) {

    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = parseFloat(x1);
        yy = parseFloat(y1);
    }
    else if (param > 1) {
        xx = parseFloat(x2);
        yy = parseFloat(y2);
    }
    else {
        xx = parseFloat(x1) + param * C;
        yy = parseFloat(y1) + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}










/**********************************************************************
 * HTML GENERATORS ****************************************************
 *********************************************************************/

/**
 * Generates the modal dialogs for a tripleg
 * @param triplegid - The id of the tripleg
 * @returns {string} - the outerHTML of the two modals
 */
function generateModal(triplegid){

    //if (getLanguage()=="en"){
    var html = '<div id="transitionModal'+triplegid+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
    html+= '<div class="modal-dialog modal-sm">';
    html+= '<div class="modal-content">';
    html+= '<h4>New transfer point</h4>';

    html+= '<p style="display:inline; border-bottom: 0px;">Transfer type: </p>';
    html+= '<select class="form-control form-control-inline" id="transitionType'+triplegid+'" style="display: inline-block; border: 0px; width:190px; color:black; font-size:15;" onchange="transitionTypeEnabler(this.id)">';
    html+= '<option value="1">Parking place</option>';
    html+= '<option value="2">Station</option>';
    html+= '</select>';

    html+= '<div id="stationInfo'+triplegid+'" style="display:none">';
    // html+= '<div class="input-group-addon">';
    html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%; margin-right:5px;" placeholder="Name" aria-describedby="basic-addon1" id="transitionName'+triplegid+'">';
    //html+= '</div>';
    // html+= '<div class="input-group-addon">';
    html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%;" placeholder="Lines: e.g.:1,2,5" aria-describedby="basic-addon1" id="transitionLines'+triplegid+'">';
    //html+= '</div>';

    html+= '<form role="form" id="checkboxForm'+triplegid+'">';
    html+= '<div class="checkbox" style="display: inline-block; width:30%;">';
    html+= '<label><input type="checkbox" value="1">Bus</label>';
    html+= '</div>';
    html+= '<div class="checkbox" style="display: inline-block; width:30%;">';
    html+= '<label><input type="checkbox" value="2">Tram</label>';
    html+= '</div>';
    html+= '<div class="checkbox" style="display: inline-block; width:30%;">';
    html+= '<label><input type="checkbox" value="3">Subway</label>';
    html+= '</div>';
    html+= '</form>';
    html+= '</div>';

   // html+= '<br>';
    html+= '<button id="transitionButton'+triplegid+'" type="button" class="btn btn-default" style="width:48%; display:inline-block; margin-left:5px" data-dismiss="modal" onclick="transitionMarker(this.id)">Draw</button>';
    html+= '<button type="button" class="btn btn-default" style="width:48%; display:inline-block;" data-dismiss="modal" ">Cancel</button>';
    html+= '</div>';
    html+= '</div>';
    html+= '</div>';

    /**
     * SECOND MODAL
     * @type {string}
     */
    html+= '<div id="transitionChoiceModal'+triplegid+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
    html+= '<div class="modal-dialog modal-sm" style="width:350px">';
    html+= '<div class="modal-content">';
    html+= '<h4 style="border-bottom: 2px solid #c25b4e;padding-bottom: 3px;">Insert a new transfer</h4>';

    html+= '<p style="display:inline-block; border-bottom: 0px; text-align: left; width:60%;">From mode of transportation: </p>';
    html+= '<select id="selectFrom'+triplegid+'" style="display: inline-block" class="form-controlV2">';
    html+= '<option value="1">'+getMode(1)+'</option>';
    html+= '<option value="2">'+getMode(2)+'</option>';
    html+= '<option value="3">'+getMode(3)+'</option>';
    html+= '<option value="4">'+getMode(4)+'</option>';
    html+= '<option value="5">'+getMode(5)+'</option>';
    html+= '<option value="6">'+getMode(6)+'</option>';
    html+= '<option value="7">'+getMode(7)+'</option>';
    html+= '<option value="8">'+getMode(8)+'</option>';
    html+= '<option value="9">'+getMode(9)+'</option>';
    html+= '<option value="10">'+getMode(10)+'</option>';
    html+= '<option value="11">'+getMode(11)+'</option>';
    html+= '<option value="12">'+getMode(12)+'</option>';
    html+= '<option value="13">'+getMode(13)+'</option>';
    html+= '<option value="14">'+getMode(14)+'</option>';
    html+= '<option value="15">'+getMode(15)+'</option>';
    html+= '</select>';
    html+= '<br>';
    html+= '<p style="display:inline-block; border-bottom: 0px; text-align: left; width:60%;">To mode of transportation: </p>';
    html+= '<select id="selectTo'+triplegid+'" style="display: inline-block" class="form-controlV2">';
    html+= '<option value="1">'+getMode(1)+'</option>';
    html+= '<option value="2">'+getMode(2)+'</option>';
    html+= '<option value="3">'+getMode(3)+'</option>';
    html+= '<option value="4">'+getMode(4)+'</option>';
    html+= '<option value="5">'+getMode(5)+'</option>';
    html+= '<option value="6">'+getMode(6)+'</option>';
    html+= '<option value="7">'+getMode(7)+'</option>';
    html+= '<option value="8">'+getMode(8)+'</option>';
    html+= '<option value="9">'+getMode(9)+'</option>';
    html+= '<option value="10">'+getMode(10)+'</option>';
    html+= '<option value="11">'+getMode(11)+'</option>';
    html+= '<option value="12">'+getMode(12)+'</option>';
    html+= '<option value="13">'+getMode(13)+'</option>';
    html+= '<option value="14">'+getMode(14)+'</option>';
    html+= '<option value="15">'+getMode(15)+'</option>';
    html+= '</select>';
    html+= '<br>';

    html+= '<div class="input-group bootstrap-timepicker">';
    html+= 'Start of transfer: <input id="timepickerStartTransition'+triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
    html+= '</div>';

    html+= '<div class="input-group bootstrap-timepicker">';
    html+= 'Stop of tranfer: <input id="timepickerStopTransition'+triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
    html+= '</div>';

    html+= '<button type="button" class="btn btn-default center-block" style="width:48%; display:inline-block; margin-left:5px" onclick="requestTimeConfirmation(\''+triplegid+'\')">Accept</button>';
    html+= '<button type="button" class="btn btn-default center-block" data-dismiss="modal" style="width:48%; display:inline-block;">Cancel</button>';

    html+= '</div>';
    html+= '</div>';
    html+= '</div>';
    //}
    /*else
    {
        var html = '<div id="transitionModal'+triplegid+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
        html+= '<div class="modal-dialog modal-sm">';
        html+= '<div class="modal-content">';
        html+= '<h4>Ny bytespunkt</h4>';

        html+= '<p style="display:inline; border-bottom: 0px;">Typ av bytespunkt:: </p>';
        html+= '<select class="form-control form-control-inline" id="transitionType'+triplegid+'" style="display: inline-block; border: 0px; width:190px; color:black; font-size:15;" onchange="transitionTypeEnabler(this.id)">';
        html+= '<option value="1">Parkeringsplats</option>';
        html+= '<option value="2">Station/hållplats</option>';
        html+= '</select>';

        html+= '<div id="stationInfo'+triplegid+'" style="display:none">';
        // html+= '<div class="input-group-addon">';
        html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%; margin-right:5px;" placeholder="Namn" aria-describedby="basic-addon1" id="transitionName'+triplegid+'">';
        //html+= '</div>';
        // html+= '<div class="input-group-addon">';
        html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%;" placeholder="Lines: e.g.:1,2,5" aria-describedby="basic-addon1" id="transitionLines'+triplegid+'">';
        //html+= '</div>';

        html+= '<form role="form" id="checkboxForm'+triplegid+'">';
        html+= '<div class="checkbox" style="display: inline-block; width:30%;">';
        html+= '<label><input type="checkbox" value="1">Buss</label>';
        html+= '</div>';
        html+= '<div class="checkbox" style="display: inline-block; width:30%;">';
        html+= '<label><input type="checkbox" value="2">Spårvagn</label>';
        html+= '</div>';
        html+= '<div class="checkbox" style="display: inline-block; width:30%;">';
        html+= '<label><input type="checkbox" value="3">Tunnelbana</label>';
        html+= '</div>';
        html+= '</form>';
        html+= '</div>';

        // html+= '<br>';
        html+= '<button id="transitionButton'+triplegid+'" type="button" class="btn btn-default" style="width:48%; display:inline-block; margin-left:5px" data-dismiss="modal" onclick="transitionMarker(this.id)">Rita</button>';
        html+= '<button type="button" class="btn btn-default" style="width:48%; display:inline-block;" data-dismiss="modal" ">Avbryt</button>';
        html+= '</div>';
        html+= '</div>';
        html+= '</div>';

        *//**
         * SECOND MODAL
         * @type {string}
         *//*
        html+= '<div id="transitionChoiceModal'+triplegid+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
        html+= '<div class="modal-dialog modal-sm" style="width:350px">';
        html+= '<div class="modal-content">';
        html+= '<h4 style="border-bottom: 2px solid #c25b4e;padding-bottom: 3px;">Lägg till en ny bytespunkt</h4>';

        html+= '<p style="display:inline-block; border-bottom: 0px; text-align: left; width:60%;">Från färdsätt: </p>';
        html+= '<select id="selectFrom'+triplegid+'" style="display: inline-block" class="form-controlV2">';
        html+= '<option value="1">'+getModeSwedish(1)+'</option>';
        html+= '<option value="2">'+getModeSwedish(2)+'</option>';
        html+= '<option value="3">'+getModeSwedish(3)+'</option>';
        html+= '<option value="4">'+getModeSwedish(4)+'</option>';
        html+= '<option value="5">'+getModeSwedish(5)+'</option>';
        html+= '<option value="6">'+getModeSwedish(6)+'</option>';
        html+= '<option value="7">'+getModeSwedish(7)+'</option>';
        html+= '<option value="8">'+getModeSwedish(8)+'</option>';
        html+= '<option value="9">'+getModeSwedish(9)+'</option>';
        html+= '<option value="10">'+getModeSwedish(10)+'</option>';
        html+= '<option value="11">'+getModeSwedish(11)+'</option>';
        html+= '<option value="12">'+getModeSwedish(12)+'</option>';
        html+= '<option value="13">'+getModeSwedish(13)+'</option>';
        html+= '<option value="14">'+getModeSwedish(14)+'</option>';
        html+= '<option value="15">'+getModeSwedish(15)+'</option>';
        html+= '</select>';
        html+= '<br>';
        html+= '<p style="display:inline-block; border-bottom: 0px; text-align: left; width:60%;">Till färdsätt: : </p>';
        html+= '<select id="selectTo'+triplegid+'" style="display: inline-block" class="form-controlV2">';
        html+= '<option value="1">'+getModeSwedish(1)+'</option>';
        html+= '<option value="2">'+getModeSwedish(2)+'</option>';
        html+= '<option value="3">'+getModeSwedish(3)+'</option>';
        html+= '<option value="4">'+getModeSwedish(4)+'</option>';
        html+= '<option value="5">'+getModeSwedish(5)+'</option>';
        html+= '<option value="6">'+getModeSwedish(6)+'</option>';
        html+= '<option value="7">'+getModeSwedish(7)+'</option>';
        html+= '<option value="8">'+getModeSwedish(8)+'</option>';
        html+= '<option value="9">'+getModeSwedish(9)+'</option>';
        html+= '<option value="10">'+getModeSwedish(10)+'</option>';
        html+= '<option value="11">'+getModeSwedish(11)+'</option>';
        html+= '<option value="12">'+getModeSwedish(12)+'</option>';
        html+= '<option value="13">'+getModeSwedish(13)+'</option>';
        html+= '<option value="14">'+getModeSwedish(14)+'</option>';
        html+= '<option value="15">'+getModeSwedish(15)+'</option>';
        html+= '</select>';
        html+= '<br>';

        html+= '<div class="input-group bootstrap-timepicker">';
        html+= 'Bytet påbörjades: <input id="timepickerStartTransition'+triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
        html+= '</div>';

        html+= '<div class="input-group bootstrap-timepicker">';
        html+= 'Bytet avslutades: <input id="timepickerStopTransition'+triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
        html+= '</div>';

        html+= '<button type="button" class="btn btn-default center-block" style="width:48%; display:inline-block; margin-left:5px" onclick="requestTimeConfirmation(\''+triplegid+'\')">Acceptera</button>';
        html+= '<button type="button" class="btn btn-default center-block" data-dismiss="modal" style="width:48%; display:inline-block;">Avbryt</button>';

        html+= '</div>';
        html+= '</div>';
        html+= '</div>';
    }*/

    return html;
}

function generateTransitionEditModal(place){
// TODO

    // STEP 1 Pass data to the modal
    // STEP 2 Any modification to the original point gets pushed to the data set

    if (document.getElementById('transitionEditModal'+place.id) !=undefined) document.getElementById('transitionEditModal'+place.id).outerHTML='';


    console.log(place);

    console.log(place.osm_id);

    console.log(jQuery.extend(true,{},place));

    //if (getLanguage()=="en"){
    var html = '<div id="transitionEditModal'+place.id+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
    html+= '<div class="modal-dialog modal-sm">';
    html+= '<div class="modal-content">';
    html+= '<h4>Editing the existing transfer place</h4>';

    html+= '<p style="display:inline; border-bottom: 0px;">Transfer type: </p>';
    html+= '<select id="transferType'+place.osm_id+'"  class="form-controlV2"  onchange="transitionEditTypeEnabler(this.id)" style="display: inline-block; border: 0px; width:190px; color:black; font-size:15;">';
    if (place.type=="Parking Place"){
        html+= '<option value="1" selected>Parking place</option>';
        html+= '<option value="2">Station</option>';
    }
    else{
        html+= '<option value="1">Parking place</option>';
        html+= '<option value="2" selected>Station</option>';
    }
    html+= '</select>';


    if (place.type=="Parking Place"){
        html+= '<div id="stationTransferInfo'+place.osm_id+'" style="display:none">';
    }
    else
    {
        html+= '<div id="stationTransferInfo'+place.osm_id+'">';
    }


    //html+= '<div class="input-group-addon">';
    html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%; margin-right:5px;" value="'+place.name+'" aria-describedby="basic-addon1" id="transferName'+place.osm_id+'">';
    //html+= '</div>';
    //html+= '<div class="input-group-addon">';
    html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%;" value="'+place.transport_lines+'" aria-describedby="basic-addon1" id="transferLines'+place.osm_id+'">';
    //html+= '</div>';

    if (place.transport_types==undefined) place.transport_types ="";
    var arrayOfTypes = place.transport_types.split(",");

    html+= '<form role="form" id="checkboxTransferForm'+place.osm_id+'">';
    html+= '<div class="checkbox" style="display: inline-block; width:30%;">';

    var skip = false;
    for (var j in arrayOfTypes) if (arrayOfTypes[j]=="1") {html+= '<label><input type="checkbox" value="1" checked>Bus</label>'; skip=true;}

    if (!skip) html+= '<label><input type="checkbox" value="1">Bus</label>';

    html+= '</div>';
    html+= '<div class="checkbox" style="display: inline-block; width:30%;">';

    skip = false;
    for (var j in arrayOfTypes) if (arrayOfTypes[j]=="2") {html+= '<label><input type="checkbox" value="2" checked>Tram</label>';skip=true;}

    if (!skip) html+= '<label><input type="checkbox" value="2">Tram</label>';

    html+= '</div>';
    html+= '<div class="checkbox" style="display: inline-block; width:30%;">';

    skip = false;
    for (var j in arrayOfTypes) if (arrayOfTypes[j]=="3") {html+= '<label><input type="checkbox" value="3" checked>Subway</label>';skip=true;}

    if(!skip) html+= '<label><input type="checkbox" value="3">Subway</label>';
    html+= '</div>';
    html+= '</form>';
    html+= '</div>';

    html+= '<br>';
    html+= '<button id="transferAcceptButton'+place.osm_id+'" type="button" class="btn btn-default" style="width:48%; display:inline-block; margin-left:5px" data-dismiss="modal" onclick="acceptTransitionEditChanges($(\'#transitionEditModal'+place.id+'\').data())">Accept</button>';
    html+= '<button id="transferCancelButton'+place.osm_id+'" type="button" class="btn btn-default" style="width:48%; display:inline-block; " data-dismiss="modal" onclick="cancelTransitionEditChanges()">Cancel</button>';
    html+= '</div>';
    html+= '</div>';
    html+= '</div>';
    //}
    /*else {
        var html = '<div id="transitionEditModal'+place.id+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';
        html+= '<div class="modal-dialog modal-sm">';
        html+= '<div class="modal-content">';
        html+= '<h4>Ändra befintlig bytespunkt</h4>';

        html+= '<p style="display:inline; border-bottom: 0px;">Transfer type: </p>';
        html+= '<select id="transferType'+place.osm_id+'"  class="form-controlV2"  onchange="transitionEditTypeEnabler(this.id)" style="display: inline-block; border: 0px; width:190px; color:black; font-size:15;">';
        if (place.type=="Parking Place"){
            html+= '<option value="1" selected>Parkeringsplats</option>';
            html+= '<option value="2">Station/hållplats</option>';
        }
        else{
            html+= '<option value="1">Parkeringsplats</option>';
            html+= '<option value="2" selected>Station/hållplats</option>';
        }
        html+= '</select>';


        if (place.type=="Parking Place"){
            html+= '<div id="stationTransferInfo'+place.osm_id+'" style="display:none">';
        }
        else
        {
            html+= '<div id="stationTransferInfo'+place.osm_id+'">';
        }


        //html+= '<div class="input-group-addon">';
        html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%; margin-right:5px;" value="'+place.name+'" aria-describedby="basic-addon1" id="transferName'+place.osm_id+'">';
        //html+= '</div>';
        //html+= '<div class="input-group-addon">';
        html+= '<input type="text" class="form-controlV2" style="display:inline-block; width:49%;" value="'+place.transport_lines+'" aria-describedby="basic-addon1" id="transferLines'+place.osm_id+'">';
        //html+= '</div>';

        if (place.transport_types==undefined) place.transport_types ="";
        var arrayOfTypes = place.transport_types.split(",");

        html+= '<form role="form" id="checkboxTransferForm'+place.osm_id+'">';
        html+= '<div class="checkbox" style="display: inline-block; width:30%;">';

        var skip = false;
        for (var j in arrayOfTypes) if (arrayOfTypes[j]=="1") {html+= '<label><input type="checkbox" value="1" checked>Buss</label>'; skip=true;}

        if (!skip) html+= '<label><input type="checkbox" value="1">Buss</label>';

        html+= '</div>';
        html+= '<div class="checkbox" style="display: inline-block; width:30%;">';

        skip = false;
        for (var j in arrayOfTypes) if (arrayOfTypes[j]=="2") {html+= '<label><input type="checkbox" value="2" checked>Spårvagn</label>';skip=true;}

        if (!skip) html+= '<label><input type="checkbox" value="2">Spårvagn</label>';

        html+= '</div>';
        html+= '<div class="checkbox" style="display: inline-block; width:30%;">';

        skip = false;
        for (var j in arrayOfTypes) if (arrayOfTypes[j]=="3") {html+= '<label><input type="checkbox" value="3" checked>Tunnelbana</label>';skip=true;}

        if(!skip) html+= '<label><input type="checkbox" value="3">Tunnelbana</label>';
        html+= '</div>';
        html+= '</form>';
        html+= '</div>';

        html+= '<br>';
        html+= '<button id="transferAcceptButton'+place.osm_id+'" type="button" class="btn btn-default" style="width:48%; display:inline-block; margin-left:5px" data-dismiss="modal" onclick="acceptTransitionEditChanges($(\'#transitionEditModal'+place.id+'\').data())">Acceptera</button>';
        html+= '<button id="transferCancelButton'+place.osm_id+'" type="button" class="btn btn-default" style="width:48%; display:inline-block; " data-dismiss="modal" onclick="cancelTransitionEditChanges()">Avbryt</button>';
        html+= '</div>';
        html+= '</div>';
        html+= '</div>';
    }*/
    // attaching the newly generated modal to the other models
    document.getElementById("poiModal").outerHTML+= html;
    $('#transitionEditModal'+place.id).data('transferPlace',place);
    console.log('transitionEditModal'+place.id);
}



/**
 * Enables the transition popup for transportation stations
 * @param id - id of the tripleg from which the request occurs
 */
function transitionEditTypeEnabler(id){

    console.log(id+ " change transition type ");

    var strippedId = id.substring(12,id.length);

    console.log(strippedId);

    var transferType = document.getElementById(id);

    if (transferType.selectedIndex==1) {
        $('#stationTransferInfo'+strippedId).css('display', '')
    }
    else {
        $('#stationTransferInfo'+strippedId).css('display', 'none')
    }
}

function acceptTransitionEditChanges(data){
    console.log("doing some operations on data");
    console.log(data);
    console.log(data.transferPlace);
// TODO check function transitionMarker to get the parser for generating the edited transition
    // CREATE NEW POI WITH NEW CHARACTERISTICS

    var updatedPoi = jQuery.extend(true,{},data.transferPlace);

    console.log('transferType'+updatedPoi.osm_id);

    var transitionType = document.getElementById('transferType'+updatedPoi.osm_id);

    if (transitionType.selectedIndex==0){
        updatedPoi.name= 'Parking Place';
        updatedPoi.type = 'Parking Place';
    }
    else{
        updatedPoi.type = 'Transportation Station';
        var transitionName = document.getElementById('transferName'+updatedPoi.osm_id);
        if (transitionName.value=='') updatedPoi.name='Name unavailable';
        else updatedPoi.name=transitionName.value;
    }

    updatedPoi.transport_lines = document.getElementById('transferLines'+updatedPoi.osm_id).value;

    updatedPoi.transport_types = [];

    var checkboxes = document.getElementById('checkboxTransferForm'+updatedPoi.osm_id);
    var checkboxesChecked = [];
    for (var i=0; i<checkboxes.length; i++) {
        // And stick the checked ones onto an array...
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i].value);
        }
    }

    updatedPoi.transport_types = checkboxesChecked.toString();

    console.log(updatedPoi);

    operationTransportationPOI(updatedPoi, "update");

    for (var j in currentTrip.triplegs){
    for (var k in currentTrip.triplegs[j].places)
        if (currentTrip.triplegs[j].places[k].osm_id == updatedPoi.osm_id)
        {
            console.log("identified its equivalent");
            currentTrip.triplegs[j].places[k] = updatedPoi;
            newTransitionMarker = updatedPoi;
            console.log(currentTrip.triplegs[j].places[k]);
            $('#transitionSelect'+data.transferPlace.id+' option[value="1"]').text(updatedPoi.name);
            /*console.log('#transitionSelect'+data.transferPlace.db_id);*/
        }
    }

    // refresh the modal
    document.getElementById('transitionEditModal'+updatedPoi.id).outerHTML= "";

    generateTransitionEditModal(updatedPoi);
}


function cancelTransitionEditChanges(){
    // Do Nothing
}

function generatePOIEditModal(poi){

    //if (getLanguage()=="en"){
    var html = '<div id="poiEditModal'+poi.osm_id+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';

    html+= '<div class="modal-dialog modal-sm">';
    html+= '<div class="modal-content">';
    html+= '<h4>Edit the existing destination place</h4>';
    html+= '<div class="input-group-addon">';
    html+= '<input type="text" class="form-control" value="'+poi.name+'" aria-describedby="basic-addon1" id="poiEditName">'
    html+= '</div>'
    /*html+= '<p style="display:inline">Please select type of POI: </p>';
    html+= '<select id="selectEditBox" style="display: inline">';
    if (poi.type=="home") html+= '<option value="1" selected>Home</option>'
    else html+= '<option value="1">Home</option>';
    if (poi.type=="work") html+= '<option value="2" selected>Work</option>';
    else html+= '<option value="2">Work</option>';
    if (poi.type=="other") html+= '<option value="3" selected >Other</option>';
    else  html+= '<option value="3">Other</option>';
    html+= '</select>';
    html+= '<br>';*/

    html+= '<button type="button" class="btn btn-default center-block " data-dismiss="modal" onclick="acceptPOIEditChanges($(\'#poiEditModal'+poi.osm_id+'\').data())">Accept</button>';
    html+= '<button type="button" class="btn btn-default center-block" data-dismiss="modal" onclick="cancelPOIEditChanges()">Cancel</button>';

    html+= '</div>';
    html+= '</div>';
    html+= '</div>';
    /*}
    else {
        var html = '<div id="poiEditModal'+poi.osm_id+'" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">';

        html+= '<div class="modal-dialog modal-sm">';
        html+= '<div class="modal-content">';
        html+= '<h4>Ändra befintlig målpunkt</h4>';
        html+= '<div class="input-group-addon">';
        html+= '<input type="text" class="form-control" value="'+poi.name+'" aria-describedby="basic-addon1" id="poiEditName">'
        html+= '</div>'
        *//*html+= '<p style="display:inline">Please select type of POI: </p>';
         html+= '<select id="selectEditBox" style="display: inline">';
         if (poi.type=="home") html+= '<option value="1" selected>Home</option>'
         else html+= '<option value="1">Home</option>';
         if (poi.type=="work") html+= '<option value="2" selected>Work</option>';
         else html+= '<option value="2">Work</option>';
         if (poi.type=="other") html+= '<option value="3" selected >Other</option>';
         else  html+= '<option value="3">Other</option>';
         html+= '</select>';
         html+= '<br>';*//*

        html+= '<button type="button" class="btn btn-default center-block " data-dismiss="modal" onclick="acceptPOIEditChanges($(\'#poiEditModal'+poi.osm_id+'\').data())">Acceptera</button>';
        html+= '<button type="button" class="btn btn-default center-block" data-dismiss="modal" onclick="cancelPOIEditChanges()">Avbryt</button>';

        html+= '</div>';
        html+= '</div>';
        html+= '</div>';
    }*/

    console.log('generated #poiEditModal'+poi.osm_id);

    document.getElementById("poiModal").outerHTML+= html;
    $('#poiEditModal'+poi.osm_id).data('newPOI',poi);
}

function cancelPOIEditChanges(){

}

function acceptPOIEditChanges(data){
    //console.log(data);
    console.log(data.newPOI);
    var newPOI = jQuery.extend(true,{},data.newPOI);

    var insertedName = document.getElementById("poiEditName");

    /*var selectPoiType = document.getElementById('selectEditBox');

    var option = document.createElement("option");
    option.text=insertedName.value;
    option.value = 0;

    newMarker.name = insertedName.value;*/

    newMarker.type = "undefined type";

    newPOI.name = insertedName.value;
    newPOI.type = newMarker.type;

    console.log(newPOI);
    for (var i in currentTrip.destination_places){
    //    console.log(currentTrip.destination_places[i]);
      //  console.log('comparing ' + currentTrip.destination_places[i].osm_id +' with '+ newPOI.osm_id);
        if (currentTrip.destination_places[i].osm_id == newPOI.osm_id){
         console.log('got equivalent');
            currentTrip.destination_places[i] = newPOI;
            operationPOI(newPOI,"update");
            $('#placeSelect option[value="0"]').text(newPOI.name);

        }
    }

}

/**============SELECTORS=============================================*/

/**
 * Generates a selector for the places (for destination) associated to a trip
 * @param places - array of places (lat, lon) that have accuracy of inference embedded
 * @returns {string|string} - outerHTML of the place selector
 */
function getPlaceSelector(places){

    if (Object.prototype.toString.call(places) === '[object Array]') {
        places.sort(comparePlace);
    } else places=[];

    if (places[0] == null) places[0]={};

        var maxAccuracy = places[0].accuracy;

    if (maxAccuracy>50){
        /**
         * Can preselect for the user
         */
        var html = '<select class="form-control form-control-inline" id="placeSelect">';
    }
    else{
        var html = '<select class="form-control form-control-inline form-need-check" id="placeSelect">';
        //if (getLanguage()=="en")
            html+='<option value="-1" disabled selected style="display:none;" lang="en">Specify your destination</option>';
        /*else
            html+='<option value="-1" disabled selected style="display:none;" lang="sv">Ange din målpunkt</option>';*/
    }

    for (var i=0; i<places.length;i++){
        if (maxAccuracy>50 && i==0) {
            drawPOIMarkerLL(places[i].latitude,places[i].longitude, places[i]);
            if (places[i].added_by_user>0) generatePOIEditModal(places[i]);
        }
            if (places[i].db_id!=undefined)html+= '<option value="'+places[i].db_id+'">'+places[i].name+'</option>';
    }

    html+='<option value="100" id="removableoption" lang="en">Add new destination place</option>';
   // html+='<option value="100" id="removableoption" lang="sv">Lägg till ny målpunkt</option>';

    html+='</select>';

    return html;
}

/**
 * Generates a selector for the purposes associated with a trip
 * @param purposes - an array of purposes and their inference certainty
 * @returns {string|string} outerHTML of the purpose selector
 */
function getPurposeSelector(purposes){

    purposes.sort(comparePurpose);

    var maxAccuracy = purposes[0].accuracy;

    console.log(maxAccuracy);

    if (maxAccuracy>50){
        /**
         * Can preselect for the user
         */
        var html = '<select class="form-control form-control-inline" id="purposeSelect">';
    }
    else{
        var html = '<select class="form-control form-control-inline form-need-check" id="purposeSelect">';
        //if (getLanguage()=="en")
            html+='<option value="-1" lang="en" disabled selected style="display:none;">Specify your trip\'s purpose</option>';
        /*else
            html+='<option value="-1" lang="sv" disabled selected style="display:none;">Ange ärendet för resan</option>';*/
    }

    for (var i=0; i<purposes.length;i++){
        var purpose_name = getNameOfPurpose(purposes[i].id);
        var purpose_name_sv = getNameOfPurposeSwedish(purposes[i].id);
        //if (getLanguage()=="en") {
        html+= '<option value="'+purposes[i].id+'" lang="en">'+purpose_name+'</option>';
           // html+= '<option value="'+purposes[i].id+'" lang="sv">'+purpose_name_sv+'</option>';}
        /*else {
            html+= '<option value="'+purposes[i].id+'" lang="sv">'+purpose_name_sv+'</option>';
            html+= '<option value="'+purposes[i].id+'" lang="en">'+purpose_name+'</option>';
        }*/
    }

    html+='</select>';

    return html;
}


/**
 *  Generates a selector that contains all places associated to a tripleg
 * @param triplegid - the id of the tripleg for which the selector is generated
 * @returns {string} - outerHTML of selector
 */
function getTransitionSelector(triplegid){
    for (var i=0; i<currentTrip.triplegs.length;i++)
    {

        if (currentTrip.triplegs[i].triplegid===triplegid) {
            var needCheck = true;
            for (var j=0; j<currentTrip.triplegs[i].places.length;j++)
            {

                console.log(currentTrip.triplegs[i].places[j].osm_id+" "+currentTrip.triplegs[i].places[j].chosen_by_user+" is " +(currentTrip.triplegs[i].places[j].chosen_by_user=="true"));
                if (currentTrip.triplegs[i].places[j].chosen_by_user=="true"|| currentTrip.triplegs[i].places[j].chosen_by_user) {
                    if (currentTrip.triplegs[i].places[j].added_by_user>0)
                    {
                        drawDynamicTransitionMarker(currentTrip.triplegs[i].places[j].lat, currentTrip.triplegs[i].places[j].lon, currentTrip.triplegs[i].places[j].id);
                        generateTransitionEditModal(currentTrip.triplegs[i].places[j]);
                    }
                    else
                    drawFixedTransitionMarker(currentTrip.triplegs[i].places[j].lat, currentTrip.triplegs[i].places[j].lon, currentTrip.triplegs[i].triplegid);
                    needCheck=false;
                }
            }

            if (needCheck)
            {var html = '<select class="form-control form-control-inline form-need-check" id="transitionSelect'+triplegid+'">';
                html+='<option value="-1" disabled selected lang="en">(Optional) Specify transfer place</option>';
                //html+='<option value="-1" disabled selected style="display:none;" lang="sv">Lägg till en ny bytespunkt (frivilligt)</option>';
            }

            else{
                var html = '<select class="form-control form-control-inline" id="transitionSelect'+triplegid+'">';
            }

            for (var j=0; j<currentTrip.triplegs[i].places.length;j++)
            {
                var value = currentTrip.triplegs[i].places[j].osm_id;
                var name = currentTrip.triplegs[i].places[j].name;

                if (currentTrip.triplegs[i].places[0].name!=undefined) {

                    html += '<option value="' + value + '">' + name + '</option>';

                }
            }

            html+= '<option lang="en" value="100" id ="removableTransitionOption'+triplegid+'">Add a new transfer place</option>';
            //html+= '<option lang="sv" value="100" id ="removableTransitionOption'+triplegid+'">Lägg till en ny bytespunkt</option>';

            html+='</select>';
        }
    }

    return html;
}

/**
 * Returns the outerHTML of a MODE selector
 * @param mode - an array containing mode ids and their inference confidence
 * @param triplegid - the id of the tripleg with which the modes are associated with
 * @returns {string} - outerHTML of the mode selector
 */
function getSelector(mode, triplegid){
    var selected;

    console.log(triplegid);
    console.log(mode);
    mode.sort(compare);
    var maxVal = mode[0].certainty;


    if (maxVal<50) {
        var selector = '<select id="selectbasic'+triplegid+'" name="selectbasic" class="form-control form-need-check">';
        selector+='<option lang="en" value="-1" disabled selected style="display:none;">Specify your travel mode</option>';
        //selector+='<option lang="sv" value="-1" disabled selected style="display:none;">Ange ditt färdsätt</option>';
        console.log('nomax');
    }
    else
    {
        console.log('max');
        var selector = '<select id="selectbasic'+triplegid+'" name="selectbasic" class="form-control">';
    }

    for (var i in mode)
    {
        selected = getMode(mode[i].id);
     //   var selectedSv = getModeSwedish(mode[i].id);
       // selector+= '<option lang="sv" value="'+mode[i].id+'">'+selectedSv+'</option>';
        selector+= '<option lang="en" value="'+mode[i].id+'">'+selected+'</option>';
    }

    selector+= '</select>';
    return selector;
}

/**==============INFO PARAGRAPHS===========================*/
/**
 * Generates the outerHTML for a paragraph containing the transition places of a tripleg
 * @param triplegid - the id of the tripleg for which the paragraph is generated
 * @returns {string|string} - outerHTML of the paragraph
 */
function getTransitionPlace(triplegid){
    for (var i=0; i<currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == triplegid) {
            if (i == currentTrip.triplegs.length - 1) {
                var html = '';;
            }
            else
            {
                var html = '<p lang="en">Transfer place: '+getTransitionSelector(triplegid)+'</p>';
                //html = html+'<p lang="sv">Bytespunkt: '+getTransitionSelector(triplegid)+'</p>';
            }
        }
    }
    return html;
}


/**
 * Computes the transition time to the next tripleg element
 * @param triplegid - the id of the tripleg from which the transition time will be computed
 * @returns {string|string} - the innerHTML of a paragraph that contains the transition time in minutes
 */
function getTransitionTimeContent(triplegid){

    for (var i=0; i<currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == triplegid) {
            if (i == currentTrip.triplegs.length - 1) {
                var returnPar='';
            }
            else {
                var dateFrom = new Date(currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length - 1].time);
                var dateTo = new Date(currentTrip.triplegs[i+2].points[0].time);
                var timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
                var minutesDiff = Math.ceil(timeDiff / (1000 * 60));
              //  if (getLanguage()=="en")
                var returnPar = 'Transfer time: ' + minutesDiff + ' min <span class="glyphicon glyphicon-trash" style="float: right;" onclick="mergeWithNext(\''+triplegid+'\')"></span>';
                /*else
                    var returnPar = 'Restid: ' + minutesDiff + ' minuter <span class="glyphicon glyphicon-trash" style="float: right;" onclick="mergeWithNext(\''+triplegid+'\')"></span>';*/
            console.log("Transition time content");
            }
        }
    }
    return returnPar;
}


/**==============HTML ELEMS===========================*/

/**
 * Generates the first timeline element and adds it at the head of the timeline
 */
function generateFirstTimelineElement(){
    var ul = document.getElementById("timeline");
    var li = document.createElement("li");
    li.id= 'firstTimelineElement';


    previousPurpose = getNameOfPurpose(currentTrip.prev_trip_purpose);
    var previousPurposeSv = getNameOfPurposeSwedish(currentTrip.prev_trip_purpose);
    var previousPlace = currentTrip.prev_trip_place_name;
    // nextActualTrip.prev_trip_place= prevActualTrip.destination_places[0].osm_id;
    previousTripEndDate = new Date(currentTrip.prev_trip_stop);
    currentTripStartDate = new Date(currentTrip.triplegs[0].points[0].time);

    /*console.log(currentTrip.prev_trip_stop);
    console.log(currentTrip.triplegs[0].points[0].time);
    console.log(previousTripEndDate);
    console.log(currentTripStartDate);

    console.log(currentTrip);
    console.log(previousPurpose);*/

    var timeDiff = Math.abs(currentTripStartDate.getTime() - previousTripEndDate.getTime());
    var htmlToAddTime=''
    if ((timeDiff/1000*60)<60){
        //if (getLanguage()=="en")
        htmlToAddTime =Math.ceil(timeDiff/1000*60)+' minutes';
        /*else
            htmlToAddTime =Math.ceil(timeDiff/1000*60)+' minuter';*/
    }
    else
    {
      //  if (getLanguage()=="en")
        htmlToAddTime= Math.ceil(timeDiff / (1000 * 60 * 60))+' hours';
        /*else
            htmlToAddTime= Math.ceil(timeDiff / (1000 * 60 * 60))+' timmar';*/
    }

    var thisHtml = '<li>';

    if (previousPurpose!=null) {
        /* Add see previous button */

       //thisHtml += '<div class="tldatecontrol"> <p lang="en"><i class="glyphicon glyphicon-arrow-down"></i> Process the next trip <i class="glyphicon glyphicon-arrow-down"></i> </p>';// <p lang="sv"><i class="glyphicon glyphicon-arrow-down"></i> Gå till nästa förflyttning <i class="glyphicon glyphicon-arrow-down"></i> </p>';

        thisHtml += '<div class="tldatecontrol" id="seePrevious"> <p lang="en"> <i class="glyphicon glyphicon-arrow-up"></i> See previous trip <i class="glyphicon glyphicon-arrow-up"></i> </p>';// <p lang="sv"><i class="glyphicon glyphicon-arrow-up"></i> Gå tillbaka till den senaste förflyttningen <i class="glyphicon glyphicon-arrow-up"></i> </p>';
        thisHtml += '</div>';
        thisHtml += '</li>';

        // var previousTripEndDateLocal = new Date(previousTripEndDate).format("Y-m-d");

        var previousTripEndDateLocal = days[new Date(previousTripEndDate).getDay()]+", "+new Date(previousTripEndDate).format("Y-m-d");
        var previousTripEndDateLocalSv = days_sv[new Date(previousTripEndDate).getDay()]+", "+new Date(previousTripEndDate).format("Y-m-d");

        var previousTripEndHour = new Date(previousTripEndDate).format("H:i");

        /* Add previous trip ended panel*/
        thisHtml += '<li>';
        thisHtml += '<div class="tldate" style="width:330px"> <p lang="en">('+previousTripEndDateLocal  +') '+previousTripEndHour+' - Previous trip ended</p>';// <p lang="sv">('+previousTripEndDateLocalSv  +') '+previousTripEndHour+' - -Senaste förflyttningen slutade</p>';
        thisHtml += '</div>';
        thisHtml += '</li>';

        /* Add previous trip summary */
        thisHtml += '<li class="timeline-inverted">';
        thisHtml += '<div class="timeline-panel" id ="firstTimelinePanel">';
        thisHtml += '<div class="tl-heading">';
        thisHtml += '<h4 lang="en">Time spent at '+previousPlace+'</h4>';
        //thisHtml += '<h4 lang="sv">Vistelsetid vid målpunkt: '+previousPlace+'</h4>';

        thisHtml += '<p id="tldatefirstparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(previousTripEndDate.getHours()<10?'0':'')+previousTripEndDate.getHours()+':'+(previousTripEndDate.getMinutes()<10?'0':'')+previousTripEndDate.getMinutes()+' - '+(currentTripStartDate.getHours()<10?'0':'')+currentTripStartDate.getHours()+':'+(currentTripStartDate.getMinutes()<10?'0':'')+currentTripStartDate.getMinutes()+'</small></p>';
        thisHtml += '</div>';
        thisHtml += '<div class="tl-body">';
        thisHtml += '<p lang="en">Place: '+previousPlace+'</p>';//<p lang="sv">Plats: '+previousPlace+'</p>';
        thisHtml += '<p lang="en">Purpose: '+previousPurpose+'</p>';// <p lang="sv">Ärende: '+previousPurposeSv+'</p>';
        thisHtml += '<p lang="en" id="firsttimeend">Time: '+htmlToAddTime+'</p>';// <p lang="Sv" id="firsttimeendsv">Tid: '+htmlToAddTime+'</p>';
        thisHtml += '</div>';
        thisHtml += '</div>';
        thisHtml += '</li>';
    }
    else{
        thisHtml += '<li>';
        thisHtml += '<div class="tldate" id ="firstTimelinePanel"> <p lang="en">This is where you started using MEILI</p>' /*+
                                                                    '<p lang="sv">Det här är där du började använda MEILI</p>';*/

        thisHtml += '</div>';
        thisHtml += '</li>';
    }
    /* Add started trip info */
    var currentTripStartDateLocal = days[new Date(currentTripStartDate).getDay()]+", "+new Date(currentTripStartDate).format("Y-m-d");
    var currentTripStartDateLocalSv = days_sv[new Date(currentTripStartDate).getDay()]+", "+new Date(currentTripStartDate).format("Y-m-d");
    var currentTripStartHour = new Date(currentTripStartDate).format("H:i");

    thisHtml+='<li>';
    thisHtml+='<div class="tldate" id="tldatefirst" style="width:330px"><p lang="en" id="tldatefirstassociatedparagraph"><span class="glyphicon glyphicon-flag"></span>('+currentTripStartDateLocal  +') '+currentTripStartHour+' - Started trip</p>';// <p id="tldatefirstassociatedparagraphsv" lang="sv"><span class="glyphicon glyphicon-flag"></span>('+currentTripStartDateLocalSv  +') '+currentTripStartHour+' - Påbörjade förflyttning</p>';
    thisHtml+='<p lang="en"><i>Is this a fake trip? Click <span class="glyphicon glyphicon-trash" onclick="deleteTripModal()"></span> to delete.</i></p>';
    //thisHtml+= '<p lang="sv"><i>Är det här en verklig förflyttning? Klicka <span class="glyphicon glyphicon-trash" onclick="deleteTripModal()"></span> för att ta bort.</i></p>';
    thisHtml+='</div>';
    thisHtml+='</li>';

    li.innerHTML = thisHtml;

    ul.appendChild(li)

    console.log(currentTripStartDate);

    var seePrevious = document.getElementById('seePrevious');

    /**
     * LISTENERS
     */
    if (seePrevious!=null)
        seePrevious.onclick = previousFunction;
}

/**
 * Generates the last timeline element and adds it at the tail of the timeline
 */
function generateLastTimelineElement(){
    var ul = document.getElementById("timeline");
    var li = document.createElement("li");
    li.id= 'lastTimelineElement';

    currentTripEndDate = new Date(currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length - 1].time);

    var hours = currentTripEndDate.getHours();
    var minutes = currentTripEndDate.getMinutes();
    var seconds = currentTripEndDate.getSeconds();

    hours = hours < 10 ? '0'+ hours: hours;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;

    var currentTripEndDateLocal = days[new Date(currentTripEndDate).getDay()]+", "+new Date(currentTripEndDate).format("Y-m-d");
    var currentTripEndDateLocalSv = days_sv[new Date(currentTripEndDate).getDay()]+", "+new Date(currentTripEndDate).format("Y-m-d");

    var currentTripEndDateHour = new Date(currentTripEndDate).format("H:i");

    var thisHtml = '<li><div class="tldate" id="tldatelast" style="width: 350px;">';
    thisHtml += '<p id="tldatelastassociatedparagraph" lang="en"> <span class="glyphicon glyphicon-flag"> </span>('+currentTripEndDateLocal  +') '+currentTripEndDateHour+' - Ended trip</p>';
    //thisHtml += '<p id="tldatelastassociatedparagraphsv" lang="sv"> <span class="glyphicon glyphicon-flag"> </span>('+currentTripEndDateLocalSv  +') '+currentTripEndDateHour+' - Avslutade resa</p>';
    thisHtml += '<p lang="en"><i> Is this a fake stop? Click <span class="glyphicon glyphicon-share-alt" onclick="mergeTripModal()"> </span> to merge with next trip.</i></p>';
    //thisHtml += '<p lang="sv"><i> Är det här ett korrekt stopp? Klicka <span class="glyphicon glyphicon-share-alt" onclick="mergeTripModal()"> </span> för att sammanfoga med nästa förflyttning.</i></p>';
    thisHtml += '</div></li>';
    var places = currentTrip.destination_places;
    var purposes = currentTrip.purposes;

    if (currentTrip.next_trip_start!=null) {
    /* Add ended trip info */

        nextTripStartDate = new Date(currentTrip.next_trip_start);
        var timeDiff = Math.abs(nextTripStartDate.getTime() - currentTripEndDate.getTime());
        var hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));


        /* Add previous trip ended panel*/
        thisHtml += '<li class="timeline-inverted">';
        thisHtml += '<div class="timeline-panel"  id ="lastTimelinePanel">';
        thisHtml += '<div class="tl-heading">';
        thisHtml += '<h4 lang="en">End of trip</h4>';// <h4 lang="sv">Förflyttningens målpunkt</h4>';
        thisHtml += '<p id="tldatelastparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(currentTripEndDate.getHours()<10?'0':'')+currentTripEndDate.getHours()+':'+(currentTripEndDate.getMinutes()<10?'0':'')+currentTripEndDate.getMinutes()+' - '+(nextTripStartDate.getHours()<10?'0':'')+nextTripStartDate.getHours()+':'+(nextTripStartDate.getMinutes()<10?'0':'')+nextTripStartDate.getMinutes()+'</small></p>';
        thisHtml += '</div>';
        thisHtml += '<div class="tl-body">';
        //if (getLanguage()=="en")
            thisHtml += '<p lang="en">Place: '+getPlaceSelector(places)+'</p>';
        /*else
            thisHtml += '<p lang="sv">Plats: '+getPlaceSelector(places)+'</p>';*/

        //if (getLanguage()=="en")
            thisHtml += '<p lang="en">Purpose: '+getPurposeSelector(purposes)+'</p>';
        /*else
            thisHtml+= '<p lang="sv">Ärende: '+getPurposeSelector(purposes)+'</p>';*/
        thisHtml += '<p lang="en" id="lasttimeend">Time: '+hoursDiff+' hours</p>';// <p lang="sv" id="lasttimeendsv">Tid: '+hoursDiff+' timmar</p>';
        thisHtml += '</div>';
        thisHtml += '</div>';
        thisHtml += '</li>';

        /* Add process next trip */
        thisHtml += '<li id="processNext">';
        thisHtml += '<div class="tldatecontrol"> <p lang="en"><i class="glyphicon glyphicon-arrow-down"></i> Process the next trip <i class="glyphicon glyphicon-arrow-down"></i> </p>';// <p lang="sv"><i class="glyphicon glyphicon-arrow-down"></i> Gå till nästa förflyttning <i class="glyphicon glyphicon-arrow-down"></i> </p>';
        thisHtml += '</div>';
        thisHtml += '</li>';
    }
    else{


        thisHtml += '<li class="timeline-inverted">';
        thisHtml += '<div class="timeline-panel" id ="lastTimelinePanel">';
        thisHtml += '<div class="tl-heading">';
        thisHtml += '<h4 lang="en">End of the trip</h4>';// <h4 lang="sv">Förflyttningens målpunkt</h4>';
        thisHtml += '<p id="tldatelastparagraph"><small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(currentTripEndDate.getHours()<10?'0':'')+currentTripEndDate.getHours()+':'+(currentTripEndDate.getMinutes()<10?'0':'')+currentTripEndDate.getMinutes()+'</small></p>';
        thisHtml += '</div>';
        thisHtml += '<div class="tl-body">';

        //if (getLanguage()=="en")
            thisHtml += '<p lang="en">Place: '+getPlaceSelector(places)+'</p>';
        /*else
            thisHtml += '<p lang="sv">Plats: '+getPlaceSelector(places)+'</p>';*/

        //if (getLanguage()=="en")
            thisHtml += '<p lang="en">Purpose: '+getPurposeSelector(purposes)+'</p>';
        /*else
            thisHtml+= '<p lang="sv">Ärende: '+getPurposeSelector(purposes)+'</p>';*/

        thisHtml += '</div>';
        thisHtml += '</div>';
        thisHtml += '</li>';

        thisHtml += '<li><div class="tldate">';
        thisHtml += '<p lang="en"> These are all the trip data available now</p>';// <p lang="sv"> Detta är all resdata som finns tillgänglig nu</p>';
        thisHtml += '</div></li>';
    }

    li.innerHTML = thisHtml;

    ul.appendChild(li)

    /**
     * NO LISTENERS YET
     */

    var processNext = document.getElementById('processNext');

    if (processNext!=null)
        processNext.onclick = nextFunction;

    var selectOption = document.getElementById('placeSelect');
    selectOption.onchange = placeSelectListener;

    var selectPurposeOption = document.getElementById('purposeSelect');
    selectPurposeOption.onchange = purposeSelectListener;
}

/**
 * Generates the outerHTML of a transition panel that corresponds to a tripleg
 * @param triplegid - the id of the tripleg associated to the panel
 * @returns {string} - the panel outerHTML
 */
function getTransitionPanel(triplegid){
    // Not the last trip leg -> generate panel

    var transitionFrom = 'undefined';
    var transitionTo = 'undefined';

    var transitionFromSv = 'Namnet saknas';
    var transitionToSv = 'Namnet saknas';

    var timeFrom ='';
    var timeTo='';
    console.log(currentTrip);/*
    var actualTriplegs = currentTrip.triplegs;
    console.log(actualTriplegs);*/

    var correspondingTransitionId = 0;

    if (triplegid != currentTrip.triplegs[currentTrip.triplegs.length-1].triplegid){

        for (var i =0; i< currentTrip.triplegs.length;i++){
            console.log(currentTrip.triplegs[i].triplegid );
            if (currentTrip.triplegs[i].triplegid == triplegid){

                var currentMode = currentTrip.triplegs[i].mode;
                currentMode.sort(compare);

                var nextMode = currentTrip.triplegs[i+2].mode;
                nextMode.sort(compare);

                correspondingTransitionId = currentTrip.triplegs[i+1].triplegid;

                if (currentMode[0].certainty >= 50){
                    transitionFrom = getMode(currentMode[0].id);
                    transitionFromSv = getModeSwedish(currentMode[0].id);
                }

                if (nextMode[0].certainty >= 50){
                    transitionTo = getMode(nextMode[0].id);
                    transitionToSv = getModeSwedish(nextMode[0].id);
                }

                var dateFrom = new Date(currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].time);
                var dateTo = new Date(currentTrip.triplegs[i+2].points[0].time);

                timeFrom = (dateFrom.getHours()<10?'0':'')+dateFrom.getHours()+':'+(dateFrom.getMinutes()<10?'0':'')+dateFrom.getMinutes();
                timeTo = (dateTo.getHours()<10?'0':'')+dateTo.getHours()+':'+(dateTo.getMinutes()<10?'0':'')+dateTo.getMinutes();
                console.log(currentTrip); console.log(currentTrip.triplegs);console.log(currentTrip.triplegs[i+2]);

                console.log(timeFrom);
                console.log(timeTo);
            }
        }

        var transitionPanel= '<li><div class="tldate" id="tldate'+correspondingTransitionId+'">';
        transitionPanel+= '<p lang="en">'+ timeFrom+' - '+timeTo +' - Tranferred from '+ transitionFrom+' to '+transitionTo +'</p>';
   //     transitionPanel+= '<p lang="sv">'+ timeFrom+' - '+timeTo +' - Byte av färdsätt från '+ transitionFromSv+' till '+transitionToSv +'</p>';
        transitionPanel+= '</div></li>';
    }

    return transitionPanel;
}

/**
 * Updates the HTML of a transition panel that corresponds to a tripleg
 * @param triplegid - the id of the tripleg associated to the panel
 */
function updateTransitionPanel(triplegid){
    // ONE UPDATE

    console.log("UPDATING "+triplegid);
    var nextId = '-1';
    var nextIntermId = '-1';
    var prevIntermId = '-1';
    var prevId = '-1';

    for (var i =0; i< currentTrip.triplegs.length;i++){
        if (currentTrip.triplegs[i].triplegid == triplegid){
            if (currentTrip.triplegs[i-2]!=undefined) prevId = currentTrip.triplegs[i-2].triplegid;
            if (currentTrip.triplegs[i+2]!=undefined) nextId = currentTrip.triplegs[i+2].triplegid;
            if (currentTrip.triplegs[i+1]!=undefined) nextIntermId = currentTrip.triplegs[i+1].triplegid;
            if (currentTrip.triplegs[i-1]!=undefined) prevIntermId = currentTrip.triplegs[i-1].triplegid;
        }
    }

    var nextPanel = document.getElementById('tldate'+nextIntermId);
    var prevPanel = document.getElementById('tldate'+prevIntermId);

    var currentSelect = document.getElementById('selectbasic'+triplegid);
    var currentMode= getMode(currentSelect.options[currentSelect.selectedIndex].value);
    var currentModeSv= getModeSwedish(currentSelect.options[currentSelect.selectedIndex].value);
    var currentModeStart = document.getElementById('timepickerstart'+triplegid).value;
    var currentModeStop = document.getElementById('timepickerstop'+triplegid).value;

    if (prevId!='-1') {
        // has previous trip

        var prevSelect = document.getElementById('selectbasic'+prevId);
        var prevMode = getMode(prevSelect.options[prevSelect.selectedIndex].value);
        var prevModeSv = getModeSwedish(prevSelect.options[prevSelect.selectedIndex].value);

        console.log(prevMode);
        /*var prevModeStart = document.getElementById('timepickerstart'+prevId).value;*/
        var prevModeStop = document.getElementById('timepickerstop'+prevId).value;


        var transitionPrev = '<p lang="en" style="display:none">'+ prevModeStop+' - '+currentModeStart +' - Transferred from '+ prevMode+' to '+currentMode+'</p>';// +
            //' <p lang="sv">'+ prevModeStop+' - '+currentModeStart +' - Byte av färdsätt från '+ prevModeSv+' till '+currentModeSv+'</p>';
        prevPanel.innerHTML=transitionPrev;

        var returnPar = document.getElementById('transitiontime'+prevId);

        returnPar.innerHTML = getTransitionTimeContent(prevId);

    }
    else{
        //affects the first panel
        //TODO MODIFY HERE
        currentTripStartDate.setHours(currentModeStart.substr(0,2));
        currentTripStartDate.setMinutes(currentModeStart.substr(3,2));

        var currentTripStartDateLocal = days[new Date(currentTripStartDate).getDay()]+", "+new Date(currentTripStartDate).format("Y-m-d");
        var currentTripStartDateLocalSv = days_sv[new Date(currentTripStartDate).getDay()]+", "+new Date(currentTripStartDate).format("Y-m-d");
        var currentTripStartHour = new Date(currentTripStartDate).format("H:i");


        var firstPanel = document.getElementById('tldatefirstassociatedparagraph');
        firstPanel.innerHTML='<span class="glyphicon glyphicon-flag"></span><p lang="en">('+currentTripStartDateLocalSv +') '+currentTripStartHour+' - Started trip </p>';// <p lang="sv">('+currentTripStartDateLocalSv +') '+currentTripStartHour+" - Påbörjade förflyttning</p>";

      //  var firstPanelSv = document.getElementById('tldatefirstassociatedparagraph');
        //firstPanelSv.innerHTML = '<span class="glyphicon glyphicon-flag"></span><p lang="sv">('+currentTripStartDateLocalSv +') '+currentTripStartHour+' - Started trip </p> <p lang="sv">('+currentTripStartDateLocalSv +') '+currentTripStartHour+" - Påbörjade förflyttning</p>";

        var firstParagraph= document.getElementById('tldatefirstparagraph');
        if (firstParagraph!=undefined)
        firstParagraph.innerHTML = '<small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(previousTripEndDate.getHours()<10?'0':'')+previousTripEndDate.getHours()+':'+(previousTripEndDate.getMinutes()<10?'0':'')+previousTripEndDate.getMinutes()+' - '+(currentTripStartDate.getHours()<10?'0':'')+currentTripStartDate.getHours()+':'+(currentTripStartDate.getMinutes()<10?'0':'')+currentTripStartDate.getMinutes()+'</small>';

        var timeDiff = Math.abs(previousTripEndDate.getTime() - currentTripStartDate.getTime());
        var hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));

        var firstTimeParagraph= document.getElementById('firsttimeend');
        var firstTimeParagraphSv= document.getElementById('firsttimeendsv');
        if (firstTimeParagraph!=undefined)
        firstTimeParagraph.innerHTML = 'Time: '+hoursDiff+' hours';

        if (firstTimeParagraphSv!=undefined)
            firstTimeParagraphSv.innerHTML = 'Tid: '+hoursDiff+' timmar';
    }

    if (nextId!='-1') {
        //has next trip
        var nextSelect = document.getElementById('selectbasic'+nextId);
        var nextMode = nextSelect.options[nextSelect.selectedIndex].text;
        var nextModeStart = document.getElementById('timepickerstart'+nextId).value;
        console.log(nextModeStart);
        /*var nextModeStop = document.getElementById('timepickerstop'+nextId).value;*/
        var transitionNext = '<p lang="en">'+ currentModeStop+' - '+nextModeStart+' - Transferred from '+ currentMode+' to '+nextMode+'</p>';// <p lang="sv">'+ currentModeStop+' - '+nextModeStart+' - Byte av färdsätt från '+ currentModeSv+' till '+nextMode+'</p>';

        var returnPar = document.getElementById('transitiontime'+triplegid);

        returnPar.innerHTML = getTransitionTimeContent(triplegid);

        nextPanel.innerHTML=transitionNext;
    }
    else{
        // affects the last panel

        currentTripEndDate.setHours(currentModeStop.substr(0,2));
        currentTripEndDate.setMinutes(currentModeStop.substr(3,2));

        var nextTrip = new Date(nextTripStartDate);
        var lastPanel = document.getElementById('tldatelastassociatedparagraph');
  //      var lastPanelSv = document.getElementById('tldatelastassociatedparagraph');

        lastPanel.innerHTML='<span class="glyphicon glyphicon-flag"></span>'+currentModeStop+" - Ended trip";
//        lastPanelSv.innerHTML='<span class="glyphicon glyphicon-flag"></span>'+currentModeStop+" - Avslutade resa";

        var lastParagraph= document.getElementById('tldatelastparagraph');
        if (lastParagraph!=undefined)
        {
            lastParagraph.innerHTML = '<small class="text-muted"><i class="glyphicon glyphicon-time"></i> '+(currentTripEndDate.getHours()<10?'0':'')+currentTripEndDate.getHours()+':'+(currentTripEndDate.getMinutes()<10?'0':'')+currentTripEndDate.getMinutes()+'-'+(nextTrip.getHours()<10?'0':'')+nextTrip.getHours()+':'+(nextTrip.getMinutes()<10?'0':'')+nextTrip.getMinutes()+'</small>';
        }

        if (nextTripStartDate!=undefined){
        var timeDiff = Math.abs(nextTripStartDate.getTime() - currentTripEndDate.getTime());
        var hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        }

        var lastTimeParagraph= document.getElementById('lasttimeend');
        //var lastTimeParagraphSv= document.getElementById('lasttimeendsv');

        if (lastTimeParagraph!=undefined)
        lastTimeParagraph.innerHTML = 'Time: '+hoursDiff+' hours';

        /*if (lastTimeParagraphSv!=undefined)
            lastTimeParagraphSv.innerHTML = 'Tid: '+hoursDiff+' timmar';*/
    }

    forceLoad();
}

/**
 * Updates the HTML elements associated with the split tripleg
 * @param id - id of the tripleg to be split
 * @param tripLegA - the first tripleg replacement
 * @param tripLegB - the second tripleg replacement
 * @param index - the position of the tripleg that will be split within the current trip
 */
function pushChangesToHTML(id, tripLegA, tripLegB,tripLegPassive, index){

    var liMeta = document.getElementById('listItem'+id);
    var li = document.getElementById('listItem'+id);
    var liCircle = document.getElementById('telem_circle'+id);
    var liPanel = document.getElementById('tldate'+id);

    /*console.log(li.index());*/

    var replacedTrip = currentTrip.triplegs[index];

    currentTrip.triplegs.splice(index,1,tripLegA, tripLegPassive, tripLegB);

    console.log(currentTrip);

    var htmlTriplegA = getTimelineElementContent(tripLegA);
    var htmlTriplegB = getTimelineElementContent(tripLegB);

    htmlTriplegA+=generateModal(tripLegA.triplegid);
    htmlTriplegB+=generateModal(tripLegB.triplegid);

    if(getTransitionPanel(tripLegA.triplegid)!=undefined)
        htmlTriplegA+= getTransitionPanel(tripLegA.triplegid);

    if(getTransitionPanel(tripLegB.triplegid)!=undefined)
        htmlTriplegB+= getTransitionPanel(tripLegB.triplegid);

    var ul = document.getElementById('timeline');

    console.log(li.parentNode.parentNode);

    console.log(ul);

    var elemA = document.createElement('li');
    var elemB = document.createElement('li');

    elemA.innerHTML = htmlTriplegA;
    elemA.id = 'listItem'+tripLegA.triplegid;
    elemB.innerHTML = htmlTriplegB;
    elemB.id = 'listItem'+tripLegB.triplegid;

    ul.insertBefore(elemB, li);
    elemB.parentNode.insertBefore(elemA, elemB);

/*
    li.parentNode.style.borderBottom=0;
*/

    li.remove();

    if (liPanel!=null)
    {
        liPanel.remove();
    }
    if (liCircle!=null) {
        liCircle.remove();

    }

    /*ul.insertBefore(htmlTriplegA,htmlTriplegB);*/

    addTimelineListeners(tripLegA);
    addTimelineListeners(tripLegB);

    removePolylineFromMap(id,replacedTrip);
    addNewPolylineToMap(tripLegA,index);
    addNewPolylineToMap(tripLegPassive,index+1);
    addNewPolylineToMap(tripLegB,index+2);



    $('ul li:empty').remove();
    forceLoad();
}

/**
 * Generates the outerHTML for the timeline element corresponding to a tripleg
 * @param tripleg - the tripleg element
 * @returns {string} - outerHTML of the timeline element
 */
function getTimelineElementContent(tripleg){
    var thisHtml= '<div class="tl-circ" id="telem_circle'+tripleg.triplegid+'" style="cursor:pointer"><span class="glyphicon glyphicon-search"></span></div>';

    thisHtml+='<li>';
    thisHtml+= '<div class="timeline-panel" id="telem'+tripleg.triplegid+'">';
    thisHtml+= '<div class="tl-heading">';
    thisHtml+= '<h4>';
    thisHtml+= getSelector(tripleg.mode, tripleg.triplegid);
    thisHtml+= '</h4>';
    thisHtml+= '</div>';
    thisHtml+= '<div class="tl-body">';

    thisHtml+= '<br>';
    thisHtml+= '<div class="input-group bootstrap-timepicker">';
    //if (getLanguage()=="en"){
        thisHtml+= 'Start: <input id="timepickerstart'+tripleg.triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
    /*}
    else{
        thisHtml+= 'Början: <input id="timepickerstart'+tripleg.triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
    }*/

    thisHtml+= '</div>';

    /*if (tripleg.triplegid!=currentTrip.triplegs[currentTrip.triplegs.length-1].triplegid)*/
    thisHtml+= '<p lang="en" style="font-style:italic" id="addtransition'+tripleg.triplegid+'" onclick="generateTransitionPopup(\''+tripleg.triplegid+'\')">Did we miss a transfer? Click to add it.</p>';// <p lang="sv" style="font-style:italic" id="addtransition'+tripleg.triplegid+'" onclick="generateTransitionPopup(\''+tripleg.triplegid+'\')">Har vi missat ett byte? Klicka för att lägga till.</p>';
    thisHtml+= '<p lang="en" id="distPar'+tripleg.triplegid+'">Distance:'+getDistanceOfTripLeg(tripleg.triplegid)+'</p>';// <p lang="sv" id="distPar'+tripleg.triplegid+'">Avstånd:'+getDistanceOfTripLeg(tripleg.triplegid)+'</p>';
    thisHtml+= '<div class="input-group bootstrap-timepicker">'
    //if (getLanguage()=="en")
    thisHtml+= 'Stop: <input id="timepickerstop'+tripleg.triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
    /*else
        thisHtml+= 'Avslutning: <input id="timepickerstop'+tripleg.triplegid+'" type="text" class="input-small"><span class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span>';
    thisHtml+= '</div>';*/
    if (tripleg.triplegid!=currentTrip.triplegs[currentTrip.triplegs.length-1].triplegid) thisHtml+= '<hr>';
    thisHtml+= getTransitionPlace(tripleg.triplegid);
    thisHtml+= getTransitionTime(tripleg.triplegid);
    thisHtml+= '</div>';

    return thisHtml;
}

/**
 * Appends the timeline element of a tripleg to the timeline list and adds its listeners
 * @param tripleg - the tripleg element
 */
function generateTimelineElement(tripleg){

    if (tripleg.type_of_tripleg == 1){
    var ul = document.getElementById("timeline");
    var li = document.createElement("li");
    li.id = "listItem"+tripleg.triplegid;
    var thisHtml = getTimelineElementContent(tripleg);

    thisHtml+=generateModal(tripleg.triplegid);

    if(getTransitionPanel(tripleg.triplegid)!=undefined)
        thisHtml+= getTransitionPanel(tripleg.triplegid);

    li.innerHTML = thisHtml;

    ul.appendChild(li);

    addTimelineListeners(tripleg);
    }

    /*$('#timepickerstart'+tripleg.triplegid).timepicker().on('changeTime.timepicker', function(e){
     console.log('checking for integrity');
     });

     $('#timepickerstop'+tripleg.triplegid).timepicker().on('changeTime.timepicker', function (e){
     console.log('checking for integrity');
     });*/
}

/**
 * Generates a popup that allows the user to specify a new transition within a tripleg  -> called from HTML
 * @param id - the id of the tripleg with which the popup will be associated
 */
function generateTransitionPopup(id){

    //TODO SHOULD THIS BE ADDED TO FRONT END LOG?

    var fromTime;
    var toTime;
    var triplegStartDate;
    var triplegEndDate;

    // Get data associated with the tripleg id
    for (var i=0; i<currentTrip.triplegs.length;i++){
        if (currentTrip.triplegs[i].triplegid == id){
            triplegStartDate = new Date(currentTrip.triplegs[i].points[0].time);
            triplegEndDate = new Date(currentTrip.triplegs[i].points[currentTrip.triplegs[i].points.length-1].time);
        }
    }

    var transitionSelectOptionFrom = document.getElementById('selectFrom'+id);
    var transitionSelectOptionTo = document.getElementById('selectTo'+id);

    $('#transitionChoiceModal'+id).data('modeFrom',1);
    $('#transitionChoiceModal'+id).data('modeTo',1);

    transitionSelectOptionFrom.onchange = function (){
        $('#transitionChoiceModal'+id).data('modeFrom',this.value);
    };

    transitionSelectOptionTo.onchange = function (){
        $('#transitionChoiceModal'+id).data('modeTo',this.value);
    };

    $('#timepickerStartTransition'+id).timepicker({
        minuteStep: 1,
        showMeridian: false,
        defaultTime:(triplegStartDate.getHours()<10?'0':'') +triplegStartDate.getHours()+":"+(triplegStartDate.getMinutes()<10?'0':'')+triplegStartDate.getMinutes()
    });

    fromTime = new Date(triplegStartDate);

    $('#timepickerStopTransition'+id).timepicker({
        minuteStep: 1,
        showMeridian: false,
        defaultTime:(triplegEndDate.getHours()<10?'0':'') +triplegEndDate.getHours()+":"+(triplegEndDate.getMinutes()<10?'0':'')+triplegEndDate.getMinutes()
    });

    toTime = new Date(triplegEndDate);

    $('#timepickerStartTransition'+id).timepicker().on('hide.timepicker', function(e){
        fromTime.setHours(e.time.hours);
        fromTime.setMinutes(e.time.minutes);
        $('#transitionChoiceModal'+id).data('fromTime',fromTime);
        checkTemporalIntegrityRules(fromTime, toTime, triplegStartDate, triplegEndDate, id);
    });

    $('#timepickerStopTransition'+id).timepicker().on('hide.timepicker', function(e){
        toTime.setHours(e.time.hours);
        toTime.setMinutes(e.time.minutes);
        $('#transitionChoiceModal'+id).data('toTime',toTime);
        checkTemporalIntegrityRules(fromTime, toTime, triplegStartDate, triplegEndDate, id);
    });

    $('#transitionChoiceModal'+id).data('id',id);
    $('#transitionChoiceModal'+id).data('triplegStartDate',triplegStartDate);
    $('#transitionChoiceModal'+id).data('triplegEndDate',triplegEndDate);
    $('#transitionChoiceModal'+id).data('fromTime',fromTime);
    $('#transitionChoiceModal'+id).data('toTime',toTime);


    /* $('#transitionChoiceModal'+id).on('hide', function(){

     });*/

    $('#transitionChoiceModal'+id).modal('show');
}



/**********************************************************************
 * LISTENERS AND EVENTS ***********************************************
 *********************************************************************/

/**===================== TRANSITION RELATED ==========================*/

/**
 * Reflects the selection of transition places in the data model
 */
function transitionSelectListener(){
    //TODO MODIFY THIS IS UNDEFINED NOW
    this.className = this.className.replace( /(?:^|\s)form-need-check(?!\S)/g , ' form-checked' );
    var changedTripLeg = this.id.substring(16,this.id.length);
    var changedValue = this.value;
    $.when(logFrontEndOperation(userId, 'chose a new transition point with value '+this.value).done(function(){

        if (changedValue == 100) {
            $('#transitionModal'+changedTripLeg).modal('show');
        }
        else{
            for (var i in currentTrip.triplegs) {
                if (currentTrip.triplegs[i].triplegid == changedTripLeg) {
                    for (var j = 0; j < currentTrip.triplegs[i].places.length; j++) {
                        if (changedValue == currentTrip.triplegs[i].places[j].osm_id)
                        {
                            currentTrip.triplegs[i].places[j].chosen_by_user=true;
                            console.log(currentTrip.triplegs[i].places[j]);
                            console.log(changedTripLeg);

                            // console.log(currentTrip.triplegs[i].places[j]);

                            if (currentTrip.triplegs[i].places[j].added_by_user<0)
                            drawFixedTransitionMarker(currentTrip.triplegs[i].places[j].lat, currentTrip.triplegs[i].places[j].lon,changedTripLeg);
                            else
                            {
                                currentTrip.triplegs[i].places[j].id = currentTrip.triplegs[i].triplegid;
                                drawDynamicTransitionMarker(currentTrip.triplegs[i].places[j].lat, currentTrip.triplegs[i].places[j].lon,changedTripLeg);
                                generateTransitionEditModal(currentTrip.triplegs[i].places[j]);
                            }

                            var request = pushTriplegModification(null, currentTrip.triplegs[i],"upsert", currentTrip.tripid);

                        }
                        else {
                            console.log(changedValue +' == '+ currentTrip.triplegs[i].places[j].osm_id);
                            currentTrip.triplegs[i].places[j].chosen_by_user = false;
                        }
                    }
                    console.log(currentTrip.triplegs[i].places);
                }
            }
        }
    }));
}

/**
 * Enables the transition popup for transportation stations
 * @param id - id of the tripleg from which the request occurs
 */
function transitionTypeEnabler(id){

    var strippedId = id.substring(14,id.length);

    var transitionType = document.getElementById(id);

    if (transitionType.selectedIndex==1) {
        $('#stationInfo'+strippedId).css('display', '')
    }
    else {
        $('#stationInfo'+strippedId).css('display', 'none')
    }
}


/**===================== DESTINATION POI RELATED ==========================*/

function enablingListener(){
    generateOnDemandGuide(currentTrip);
}
/**
 * Listener that updates the places array to correspond to the user's choice
 */
function placeSelectListener(){
    //TODO probably this is also undefined now
    this.className = this.className.replace( /(?:^|\s)form-need-check(?!\S)/g , ' form-checked' );

    var thisValue = this.value;

    $.when(logFrontEndOperation(userId,'selected new place').done(function(){

     console.log(thisValue);

    for (var i=0; i<currentTrip.destination_places.length;i++)
    {
        //console.log(currentTrip.destination_places[i]);
        //console.log(currentTrip.destination_places[i].db_id+' and '+thisValue);
        if (currentTrip.destination_places[i].db_id == thisValue){
            console.log('got here');
            currentTrip.destination_places[i].accuracy=100;
            console.log(currentTrip.destination_places[i]);

            if (currentTrip.destination_places[i].added_by_user>0) generatePOIEditModal(currentTrip.destination_places[i]);

            drawPOIMarkerLL(currentTrip.destination_places[i].latitude,currentTrip.destination_places[i].longitude, currentTrip.destination_places[i]);

            var request = pushTripModification(null, currentTrip,"upsert", serverResponse.trips[getNextPassiveTrip(currentTrip.tripid)]);

            $.when(request ).done(function (){
                getPurposeFromDb(userId, currentTrip, this.value);
            });

        }
        else
        if (thisValue==100){
            console.log('modal');
            $('#poiModal').modal('show');
        }
        else
        {
            currentTrip.destination_places[i].accuracy=0;
        }
    }

        if (Object.prototype.toString.call(currentTrip.destination_places) != '[object Array]') {
            if (thisValue==100){
            console.log('modal');
            $('#poiModal').modal('show');
        }
        }

    console.log(currentTrip.destination_places);
    }));
}


/**
 * Listener that updates the purposes of the trip according to user input
 */
function purposeSelectListener(){
    //TODO probably also undefined

    this.className = this.className.replace( /(?:^|\s)form-need-check(?!\S)/g , ' form-checked' );

    var thisValue = this.value;

    $.when(logFrontEndOperation(userId,'selected new purpose').done(function(){
        for (var i=0; i<currentTrip.purposes.length;i++)
            {
                console.log(currentTrip.purposes[i].id +'=='+ this.value+' is '+(currentTrip.purposes[i].id == thisValue));
                if (currentTrip.purposes[i].id == thisValue){
                    currentTrip.purposes[i].accuracy=100;
                   var request = pushTripModification(null, currentTrip,"upsert", serverResponse.trips[getNextPassiveTrip(currentTrip.tripid)]);
                }
                else
                    currentTrip.purposes[i].accuracy=0;
            }
    }));
}

/**===================== TRIPLEG ==========================*/

/**
 * A listener for the mode selector
 */
function selectOptionListener(){

    // TODO push mode change to tripleg

    var newMode = this.value;
    var optionListener = this;
    var changedTripLeg = this.id.substring(11,this.id.length);

    var request = logFrontEndOperation(userId,'selected new mode '+newMode+' of tripleg '+changedTripLeg);
    // request.data = {newMode: newMode, optionListener:optionListener, changedTripleg:changedTripLeg};
    $.when(request.done(function(){

    /**
     * Alter class to match change
     */

    optionListener.className = optionListener.className.replace( /(?:^|\s)form-need-check(?!\S)/g , ' form-checked' );

    for (var i=0; i<currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == changedTripLeg) {
            for (var j=0; j<currentTrip.triplegs[i].mode.length; j++) {
                if (currentTrip.triplegs[i].mode[j].id == newMode)
                {
                    currentTrip.triplegs[i].mode[j].certainty= 100;
                    var layer = plotlayers[correspondingPolyline[changedTripLeg]];

                    /*document.getElementById('telem'+tripleg.triplegid).style.color = "red";*/
                    var polylineColor = getColorById(newMode);
                    layer.setStyle({
                        color: polylineColor
                    });

                    console.log(jQuery.extend(true,{},currentTrip.triplegs[i]));

                    var request = pushTriplegModification(null, currentTrip.triplegs[i],"upsert",currentTrip.tripid);
                    $.when(request ).done(function (){
                        pushTripModification(null, currentTrip,"upsert", serverResponse.trips[getNextPassiveTrip(currentTrip.tripid)]);
                    });

                    updateTransitionPanel(changedTripLeg);
                }
                else
                    currentTrip.triplegs[i].mode[j].certainty= 0;
            }

            currentTrip.triplegs[i].triplegid= changedTripLeg;
            break;
        }
    }
    }));
}

/**
 * Adds listeners to a timeline element associated with a tripleg and checks for consequences of time change
 * @param tripleg - tripleg
 */
function addTimelineListeners(tripleg){
    var transitionSelectOption = document.getElementById('transitionSelect'+tripleg.triplegid);

    if (transitionSelectOption!=null)
        transitionSelectOption.onchange = transitionSelectListener;

    console.log(tripleg.triplegid);

    console.log(currentTrip);
    console.log(tripleg);
    var initialTime = new Date(tripleg.points[0].time);
    var endTime = new Date(tripleg.points[tripleg.points.length-1].time);
    console.log(initialTime);
    console.log(endTime);

    var selectOption = document.getElementById('selectbasic'+tripleg.triplegid);
    selectOption.onchange = selectOptionListener;

    /********************************************
     * Adding listeners to the timeline elements*
     ********************************************/

    /**
     * Mouse over
     */
    $("#telem"+tripleg.triplegid).mouseover(function()
    {
        var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];

        /*document.getElementById('telem'+tripleg.triplegid).style.color = "blue";*/
        layer.setStyle({
            opacity:1
        });

    });

    /**
     * Mouse exit
     */

    $("#telem"+tripleg.triplegid).mouseout(function()
    {
        var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];

        /*document.getElementById('telem'+tripleg.triplegid).style.color = "red";*/

        layer.setStyle({
            opacity:0.6
        });

    });

    /**
     * Mouse click
     */

    $("#telem_circle"+tripleg.triplegid).click(function()
    {
        var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];
        map.fitBounds(layer);

        logFrontEndOperation(userId,'zoomed to layer '+tripleg.triplegid);
        //map.panTo(layer.getBounds().getCenter());


        /* layer.setStyle({
         weight: 5,
         color: 'black',
         dashArray: '',
         fillOpacity: 0.7
         });*/

    });

    /**
     * Initialize time pickers
     */

    var initialTime = new Date(tripleg.points[0].time);
    var endTime = new Date(tripleg.points[tripleg.points.length-1].time);

    $('#timepickerstart'+tripleg.triplegid).timepicker({
        minuteStep: 1,
        showMeridian: false,
        disableMousewheel:false,
        defaultTime:(initialTime.getHours()<10?'0':'')+initialTime.getHours()+":"+(initialTime.getMinutes()<10?'0':'')+initialTime.getMinutes()
    });


    $('#timepickerstop'+tripleg.triplegid).timepicker({
        minuteStep: 1,
        showMeridian: false,
        disableMousewheel:false,
        defaultTime: (endTime.getHours()<10?'0':'') +endTime.getHours()+":"+(endTime.getMinutes()<10?'0':'')+endTime.getMinutes()
    });

    $('#timepickerstart'+tripleg.triplegid).timepicker().on('hide.timepicker', function(e) {
       if(true){

           console.log(tripleg);
           initialTime = tripleg.points[0].time;
           endTime =  tripleg.points[tripleg.points.length-1].time;
           var initialTimeDate = new Date(tripleg.points[0].time);
           var endTimeDate =  new Date(tripleg.points[tripleg.points.length-1].time);

           var tempTime = new Date(initialTime);
           var prevInitialTime = initialTime;
           var prevEndTime = endTime;
           console.log(tempTime);
           console.log(endTime);
           tempTime.setMinutes(e.time.minutes);
           tempTime.setHours(e.time.hours);
           console.log(tripleg);
           tempTime = tempTime.getTime();

           logFrontEndOperation(userId,'changed timepicker start value of tripleg '+tripleg.triplegid+' to '+ tempTime);

           /**
            * CONSEQUENCE 0 - Start time sooner than end time
            */

           console.log(tempTime+'<'+endTime+' ' +(tempTime<endTime));

           if (tempTime<endTime)
           {
               /**
                * CONSEQUENCE 1 - Within the trip's time frame
                * a) if it is the first trip leg, the currentTripStartDate can be changed , but not before the end of last trip
                * b) if it is the last trip leg, the currentTripEndDate can be changed, but not after the beginning of next trip
                */

               console.log("Checking if start time is within the current trip "+ tempTime+" later than "+previousTripEndDate.getTime());
               console.log("Checking if start time is within the current trip "+ tempTime+" earlier than "+nextTripStartDate.getTime());

               try {
               updateTimeOfTripleg(currentTrip, tripleg, tempTime, null, previousTripEndDate.getTime(), nextTripStartDate.getTime());
                   logFrontEndOperation(userId, 'update start time of tripleg to '+tempTime);
               }
               catch (exception){
                logError(userId, exception, serverResponse);
               }
           }
           else {
               //if (getLanguage()=="en")
               alert('Trip\'s start time cannot be later than the trip\'s end time');
               /*else
               alert('Förflyttningens starttid kan inte vara senare än sluttiden');*/
               $('#timepickerstart'+tripleg.triplegid).timepicker('setTime',initialTimeDate.getHours()+":"+initialTimeDate.getMinutes());
           }
       }

    });

    $('#timepickerstop'+tripleg.triplegid).timepicker().on('hide.timepicker', function(e) {
        console.log(tripleg);
        initialTime = tripleg.points[0].time;
        endTime = tripleg.points[tripleg.points.length-1].time;
        var initialTimeDate = new Date(tripleg.points[0].time);
        var endTimeDate =  new Date(tripleg.points[tripleg.points.length-1].time);

        console.log(initialTime);
        var copyOfInitialTime =  initialTime;
        var copyOfEndTime =  endTime;
        console.log(copyOfEndTime);
        console.log(copyOfInitialTime);
        var tempTime = new Date(copyOfInitialTime);
        var prevInitialTime = copyOfInitialTime;
        var prevEndTime = copyOfEndTime;
        tempTime.setMinutes(e.time.minutes);
        tempTime.setHours(e.time.hours);

        console.log(tempTime);

        tempTime = tempTime.getTime();

        logFrontEndOperation(userId,'changed timepicker stop value of tripleg '+tripleg.triplegid+' to '+ tempTime);

        /**
         * CONSEQUENCE 0 - Start time sooner than end time
         */

        console.log(tempTime+'>'+initialTime+' ' +(tempTime>initialTime));
        if (tempTime>initialTime) {


            /**
             * CONSEQUENCE 1 - Within the trip's time frame
             * a) if it is the first trip leg, the currentTripStartDate can be changed , but not before the end of last trip
             * b) if it is the last trip leg, the currentTripEndDate can be changed, but not after the beginning of next trip
             */
            console.log("Checking tripleg "+tripleg.triplegid);
            console.log("Checking if end time is within the current trip "+ tempTime+" later than "+previousTripEndDate.getTime());
            console.log("Checking if end time is within the current trip "+ tempTime+" earlier than "+nextTripStartDate.getTime());

            try {
                logFrontEndOperation(userId,'update end time of tripleg to '+tempTime);

                updateTimeOfTripleg(currentTrip, tripleg, null, tempTime, previousTripEndDate.getTime(), nextTripStartDate.getTime());
            }
            catch (exception){
                logError(userId, exception, serverResponse);
            }

            if (tempTime>previousTripEndDate && tempTime<nextTripStartDate)
            {
          //  checkTemporalConsequences(initialTime, tempTime, tripleg, prevInitialTime,prevEndTime);
            }
            else
            {
                var fooTest1 = false;
                if (nextTripStartDate==undefined) fooTest1=true;
                else if(isNaN(nextTripStartDate.getTime())) fooTest1=true;

                var fooTest2 = false;
                if (previousTripEndDate==undefined) fooTest2=true;
                else if(isNaN(previousTripEndDate.getTime())) fooTest2=true;

                if (!fooTest1&&!fooTest2)
                {//if (getLanguage()=="en")
                    alert('Operations are only allowed within the current trip time frame');
                   /* else
                    alert('Ändringar kan bara göras inom tidsperioden för denna förflyttning');*/
                $('#timepickerstop'+tripleg.triplegid).timepicker('setTime',endTimeDate.getHours()+":"+endTimeDate.getMinutes());}
            }
        }
        else{
            if (getLanguage()=="en")
            alert('Trip\'s end time cannot be sooner than trip\'s start time');
            /*else
                alert('Förflyttningens sluttid kan inte vara tidigare än starttiden');*/
            $('#timepickerstop'+tripleg.triplegid).timepicker('setTime',endTime.getHours()+":"+endTime.getMinutes());
        }

    });
}

/**
 * Map Event function -  highlights the polyline when the mouse is on top and highlights the corresponding timeline element
 * @param e
 */
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        opacity: 1
    });

    setTimelineHover(correspondingTimeline[layer._leaflet_id]);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToBack();
    }
}

/**
 * Map Event function - restores to normal the polyline display and the corresponding timeline element
 * @param e
 */
function resetHighlight(e) {
    var layer = e.target;

    layer.setStyle({
        opacity: 0.6
    });

    cancelTimelineHover(correspondingTimeline[layer._leaflet_id]);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToBack();
    }
}

/**
 * Map Event function - when a polyline segment is clicked, the timeline is scrolled down to its corresponding element
 * @param e
 */
function scrollToTimeline(e) {

    var layer = e.target;

    $('html, body').animate({
        scrollTop: $('#telem'+correspondingTimeline[layer._leaflet_id]).offset().top-60
    }, 'slow');

}

/**
 * Map Event direct effect over timeline - when hovering over a polyline, its corresponding element is highlighted
 * @param id - the id of the current trip that represents the polyline
 */
function setTimelineHover(id){
    document.getElementById('telem'+id).style.border = "5px solid #d4d4d4";
}

/**
 * Map Event direct effect over timeline - when finished hovering over a polyline, its corresponding element's highlight is interrupted
 * @param id - the id of the current trip that represents the polyline
 */
function cancelTimelineHover(id){
    document.getElementById('telem'+id).style.border = "1px solid #d4d4d4";
}





/**
 * Map Event function -  highlights the polyline when the mouse is on top and highlights the corresponding timeline element
 * @param e
 */
function highlightPassiveFeature(e) {
    var layer = e.target;

    layer.setStyle({
        opacity: 1
    });

    setPassiveTimelineHover(correspondingTimeline[layer._leaflet_id]);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToBack();
    }
}

/**
 * Map Event function - restores to normal the polyline display and the corresponding timeline element
 * @param e
 */
function resetPassiveHighlight(e) {
    var layer = e.target;

    layer.setStyle({
        opacity: 0.6
    });

    cancelPassiveTimelineHover(correspondingTimeline[layer._leaflet_id]);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToBack();
    }
}

/**
 * Map Event function - when a polyline segment is clicked, the timeline is scrolled down to its corresponding element
 * @param e
 */
function scrollToPassiveTimeline(e) {

    var layer = e.target;

    $('html, body').animate({
        scrollTop: $('#tldate'+correspondingTimeline[layer._leaflet_id]).offset().top-60
    }, 'slow');

}

/**
 * Map Event direct effect over timeline - when hovering over a polyline, its corresponding element is highlighted
 * @param id - the id of the current trip that represents the polyline
 */
function setPassiveTimelineHover(id){
    document.getElementById('tldate'+id).style.border = "5px solid #212121";
}

/**
 * Map Event direct effect over timeline - when finished hovering over a polyline, its corresponding element's highlight is interrupted
 * @param id - the id of the current trip that represents the polyline
 */
function cancelPassiveTimelineHover(id){
    document.getElementById('tldate'+id).style.border = "3px solid #212121";
}


/**********************************************************************
 * MAP INTERACTION ****************************************************
 *********************************************************************/


/**===================== TRANSITION RELATED ==========================*/

/**
 * Draws a new marker associated with a transition point on the map and adds a listener to drag events
 * @param latlon - position of the marker
 */
function drawTransitionMarker(latlon, poiId){

    newTransitionMarker.lat = latlon.lat;
    newTransitionMarker.lon = latlon.lng;
    console.log(newTransitionMarker);

    /*map.removeLayer(marker);
    for (var i in fixedTransitionMarker)*/
    if (fixedTransitionMarkers[poiId]!=undefined)
        map.removeLayer(fixedTransitionMarkers[poiId]);

    insertedNewTransitionMarker();

    var transitionIcon = L.icon({
        iconUrl: 'images/Bus.png',
        iconSize: [20, 20],
        iconAnchor: [0, 0]
    });

    var transitionDragMarker = new L.marker(latlon, {id:poiId, draggable:'true', icon:transitionIcon});

    transitionDragMarker.on('dragend', function(event){
        transitionDragMarker = event.target;
        var position = transitionDragMarker.getLatLng();
        console.log(transitionDragMarker);
        transitionDragMarker.setLatLng(position,{id:poiId,draggable:'true'}).bindPopup(position).update();
        newTransitionMarker.lat = position.lat;
        newTransitionMarker.lon = position.lng;
        updatedNewTransitionMarker(poiId);
    });

    transitionDragMarker.on('mouseover', function(event){
        transitionDragMarker.setOpacity(1);
    });

    transitionDragMarker.on('mouseout', function(event){
        transitionDragMarker.setOpacity(0.5);
    });

    transitionDragMarker.on('click', function(event){
        console.log('got to the click event');
        $('#transitionEditModal'+poiId).modal('show');
        console.log('#transitionEditModal'+poiId);
    });

    draggableTransitionMarkers[poiId] = transitionDragMarker;

    map.addLayer(draggableTransitionMarkers[poiId]);
}

function drawDynamicTransitionMarker(lat,lon,tripleg){
    console.log(tripleg);
    var transitionIcon = L.icon({
        iconUrl: 'images/Bus.png',
        iconSize: [20, 20],
        iconAnchor: [0, 0]
    });
    map.removeLayer(marker);

    if (fixedTransitionMarkers[tripleg]!=undefined)
        map.removeLayer(fixedTransitionMarkers[tripleg]);

    var latlon = new L.latLng(lat,lon);
    /*

     console.log(key+' '+lat+','+lon);
     console.log(fixedTransitionMarker[key]);

     if (fixedTransitionMarker[key]!=undefined)
     {
     console.log('removed layer');
     map.removeLayer(fixedTransitionMarker[key]);
     }*/

    fixedTransitionMarkers[tripleg] = new L.marker(latlon, {id:tripleg, icon:transitionIcon, draggable:true});

    fixedTransitionMarkers[tripleg].on('click', function(event){
        console.log(this);
        /*console.log('transitionEditModal'+tripleg.triplegid);*/
        $('#transitionEditModal'+this.options.id).modal('show');
    });
    map.addLayer(fixedTransitionMarkers[tripleg]);
}

function drawFixedTransitionMarker(lat, lon,key){

    var transitionIcon = L.icon({
        iconUrl: 'images/Bus.png',
        iconSize: [20, 20],
        iconAnchor: [0, 0]
    });
    map.removeLayer(marker);

    if (fixedTransitionMarkers[key]!=undefined)
        map.removeLayer(fixedTransitionMarkers[key]);

    var latlon = new L.latLng(lat,lon);
    /*

    console.log(key+' '+lat+','+lon);
    console.log(fixedTransitionMarker[key]);

    if (fixedTransitionMarker[key]!=undefined)
    {
        console.log('removed layer');
        map.removeLayer(fixedTransitionMarker[key]);
    }*/

    fixedTransitionMarkers[key] = new L.marker(latlon, {id:key, icon:transitionIcon});

    map.addLayer(fixedTransitionMarkers[key]);
}

/**
 * Inserts a new transition marker on
 */
function insertedNewTransitionMarker(){

    operationTransportationPOI(newTransitionMarker,"insert");
}

function insertedNewTransitionMarkerAfterCall(newPOI){
    for (var i=0; i<currentTrip.triplegs.length; i++) {

        if (currentTrip.triplegs[i].triplegid == newTransitionMarker.id) {
            newTransitionMarker.chosen_by_user = true;
            newTransitionMarker.osm_id = newPOI.osm_id;
            if (currentTrip.triplegs[i].places[0]==undefined)
            {currentTrip.triplegs[i].places[0] = newPOI;}
            else
            {
                currentTrip.triplegs[i].places[currentTrip.triplegs[i].places.length] = newPOI;
            }
            console.log(currentTrip.triplegs);
            pushTriplegModification(null, currentTrip.triplegs[i], "upsert", currentTrip.tripid);
        }
    }
    generateTransitionEditModal(newTransitionMarker);
}

/**
 * Updates the position of a transition place in the current trip
 */
function updatedNewTransitionMarker(poiId){
    for (var i=0; i<currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == poiId) {
            for (var j=0; j<currentTrip.triplegs[i].places.length; j++){
                if (currentTrip.triplegs[i].places[j].osm_id == poiId){
                    currentTrip.triplegs[i].places[j].lat = newTransitionMarker.lat;
                    currentTrip.triplegs[i].places[j].lon = newTransitionMarker.lon;
                }
            }
        }
    }

    console.log(draggableTransitionMarkers);

    operationTransportationPOI(newTransitionMarker,"update");
}

/**
 * A temporary listener that waits until the transition point is specified on the map
 * @param e
 */
function addTransitionPOIListener(strippedId){

    logFrontEndOperation(userId,'drawing transition point');
    var listeningFunction = function(e) {
        console.log(e);
        console.log(strippedId);
        drawTransitionMarker(e.latlng, strippedId);
        map.off("click", listeningFunction);
        document.getElementById("map").style.cursor = "default";
    }

    map.on("click", listeningFunction);
}

/**
 * Method called by a modal dialog for the specification of a new transition point
 * @param id
 */
function transitionMarker(id){

    var strippedId = id.substring(16,id.length);

    var elementName ='';

    newTransitionMarker={};
    newTransitionMarker.userId = userId;

    var transitionType = document.getElementById('transitionType'+strippedId);
    if (transitionType.selectedIndex==0){
        elementName = 'Parking Place';
        newTransitionMarker.type = 'Parking Place';
    }
    else{
        newTransitionMarker.type = 'Transportation Station';
        var transitionName = document.getElementById('transitionName'+strippedId);
        if (transitionName.value=='')
            {
                elementName = 'Name unavailable';//getLanguage() == "en" ? 'Name unavailable' : 'Namnet saknas';
            }
        else elementName=transitionName.value;
    }

    // insert element in original array

    var selectOption = document.getElementById('transitionSelect'+strippedId);

    var option = document.createElement("option");
    option.text = elementName;
    option.value = strippedId;

    var hideObject = document.getElementById('removableTransitionOption'+strippedId);
    hideObject.style.display="none";


    console.log(marker);
    console.log(fixedTransitionMarkers);

    if (fixedTransitionMarkers[strippedId]!=undefined) map.removeLayer(fixedTransitionMarkers[strippedId]);
    /*map.removeLayer(marker);
    for (var i in fixedTransitionMarker)

*/


    newTransitionMarker.id = strippedId;
    newTransitionMarker.name = elementName;
    newTransitionMarker.transport_lines = document.getElementById('transitionLines'+strippedId).value;

    newTransitionMarker.transport_types = [];

    var checkboxes = document.getElementById('checkboxForm'+strippedId);
    var checkboxesChecked = [];
    for (var i=0; i<checkboxes.length; i++) {
        // And stick the checked ones onto an array...
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i].value);
        }
    }

    newTransitionMarker.transport_types = checkboxesChecked.toString();

    /*console.log(newTransitionMarker);
*/
    selectOption.add(option,0);
    selectOption.selectedIndex=0;

    document.getElementById("map").style.cursor = "url(images/Bus.png) 20 20 , auto";


    addTransitionPOIListener(strippedId);


    /*

     newMarker.name = insertedName.value;
     newMarker.type = getNameOfPurpose(selectPoiType.selectedIndex);

     // for map marker https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-128.png
     // for transition marker http://upload.wikimedia.org/math/b/9/e/b9ece18c950afbfa6b0fdbfa4ff731d3.png
     */
}



/**===================== DESTINATION POI RELATED ==========================*/

/**
 * Method called by a modal dialog for the specification of a new Point Of Interest
 * @constructor
 */
function POIMarker(){
    // change selected element

    logFrontEndOperation(userId, 'new POI');

    var insertedName = document.getElementById("poiName");
    console.log(insertedName);

    if (insertedName.value==='')
    {
        //if (getLanguage()=="en")
        alert('Insert a name');
        //else alert('Lägg till ett namn');
    }
    else{

        $('#poiModal').modal('hide');

        // insert element in original array

        var selectOption = document.getElementById('placeSelect');

        // var selectPoiType = document.getElementById('selectBox');

        var hideObject = document.getElementById('removableoption');
        hideObject.style.display="none";

        var option = document.createElement("option");
        option.text=insertedName.value;
        option.value = 0;

        selectOption.add(option,0);
        selectOption.selectedIndex=0;

        // console.log(selectPoiType[selectPoiType.selectedIndex].value);
        newMarker.name = insertedName.value;
        newMarker.type = 'not defined';
        newMarker.userId = userId;


        // console.log(newMarker);

        // for map marker https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-128.png
        // for transition marker http://upload.wikimedia.org/math/b/9/e/b9ece18c950afbfa6b0fdbfa4ff731d3.png
        document.getElementById("map").style.cursor = "url(../images/map.jpg) 64 64 , auto";

        map.on("click", POIListener);
    }

}

function cancelPOIMarker(){
    logFrontEndOperation(userId, 'cancelled adding a new POI');
    document.getElementById("placeSelect").innerHTML = getPlaceSelector(currentTrip.destination_places);
    $("#placeSelect").removeClass("form-checked");
    $("#placeSelect").addClass("form-need-check");
}
/**
 * A temporary listener that waits until a new Point Of Interest is specified on the map
 * @param e
 * @constructor
 */
function POIListener(e){
    logFrontEndOperation(userId,'drawing POI point');
    drawPOIMarker(e.latlng);
    map.off("click", POIListener);
    document.getElementById("map").style.cursor = "default";
}

/**
 * Draws a new marker associated with a Point Of Interest on map and adds a listener to drag events
 * @param latlon - position of the marker
 */
function drawPOIMarker(latlon){

    /*console.log(latlon);*/

    newMarker.latitude = latlon.lat;
    newMarker.longitude = latlon.lng;

    insertedNewPoiMarker();


    marker = new L.marker(latlon, {id:1, draggable:true, icon:mapMarkerIcon});

    marker.on('dragend', function(event){
        marker = event.target;
        var position = marker.getLatLng();
        /*alert(position);*/
        console.log(marker);
        marker.setLatLng(position,{id:1,draggable:true}).bindPopup(position).update();
        newMarker.latitude = position.lat;
        newMarker.longitude = position.lng;
        operationPOI(newMarker, "update");
        updatedNewPoiMarker();
    });

    marker.on('click', function(event){
        $('#poiEditModal'+newMarker.osm_id).modal('show');
    })

    map.addLayer(marker);
}

function drawPOIMarkerLL(lat,lon, poi){

    /*console.log(latlon);*/

    console.log(lat);
    console.log(lon);
    //console.log(addedByUser);

    if (marker!=undefined)

    map.removeLayer(marker);

    if (poi.added_by_user>0) {
        newMarker = jQuery.extend(true,{},poi);

        marker = new L.marker(new L.latLng(lat,lon), {id:1, draggable:true, icon:mapMarkerIcon});
        marker.on('click', function(event){
            $('#poiEditModal'+poi.osm_id).modal('show');
            console.log('accessing #poiEditModal'+poi.osm_id);
        })
        marker.on('dragend', function(event){
            marker = event.target;
            var position = marker.getLatLng();
            /*alert(position);*/
            console.log(marker);
            marker.setLatLng(position,{id:1,draggable:true}).bindPopup(position).update();
            newMarker.latitude = position.lat;
            newMarker.longitude = position.lng;
            operationPOI(newMarker, "update");
            updatedNewPoiMarker();
        });
    }
    else {
        marker = new L.marker(new L.latLng(lat, lon), {id: 1, draggable: false, icon:mapMarkerIcon});
    }

    map.addLayer(marker);
}

/**
 * Inserts the new Point Of Interest in the current trip array
 */
function insertedNewPoiMarker(){

    var newDestination = {};
    newDestination.db_id=0;
    newDestination.name=newMarker.name;
    newDestination.latitude = newMarker.latitude;
    newDestination.longitude = newMarker.longitude;
    newDestination.accuracy = 100;
    newDestination.type = newMarker.type;
    newDestination.added_by_user = 1;


    console.log(newDestination);

    for (var i=0; i<currentTrip.destination_places.length;i++)
        currentTrip.destination_places[i].accuracy=0;

    currentTrip.destination_places[currentTrip.destination_places.length]= newDestination;
    console.log(currentTrip.destination_places);

    if (marker!=undefined)
        map.removeLayer(marker);

    operationPOI(newMarker, "insert");

   // var latLon = new L.LatLng(newDestination.latitude, newDestination.longitude);

    // console.log(latLon);
}

function insertedNewPoiMarkerAfterCall(){
    console.log('after call');
    pushTripModification(null, currentTrip,"upsert", serverResponse.trips[getNextPassiveTrip(currentTrip.tripid)]);
}

/**
 * Updates the position of a Point Of Interest on drag events
 */
function updatedNewPoiMarker(){
    currentTrip.destination_places[currentTrip.destination_places.length-1].latitude = newMarker.latitude;
    currentTrip.destination_places[currentTrip.destination_places.length-1].longitude = newMarker.longitude;
}


/**======================ON MAP DRAWING================================================*/
/**
 * Removes a polyline layer associated with a tripleg from the map
 * @param id - id of the tripleg
 * @param replacedTripLeg - the trip leg that will be replaced
 */
function removePolylineFromMap(id, replacedTripLeg){
    var layer = plotlayers[correspondingPolyline[id]];

    map.removeLayer(layer);
    removePolylinePoints(replacedTripLeg);

}


function updatePolyline(triplegid){

    console.log(correspondingPolyline[triplegid]);

    //TODO recompute transition times and distances

    map.removeLayer(plotlayers[correspondingPolyline[triplegid]]);

    for (var i in currentTrip.triplegs){
        if (currentTrip.triplegs[i].triplegid==triplegid)
        {
            removePolylinePoints(currentTrip.triplegs[i]);
            generatePolyline(currentTrip.triplegs[i],map,i);
        }
    }
}

function addPoint(){

}

function removePoint(){

}

/**
 * Adds a new polyline to map - WARNING USELESS CODE
 * @param tripleg
 * @param i
 */
function addNewPolylineToMap(tripleg, i){
    generatePolyline(tripleg,map,i);
}

/**
 * Removes all the points from the pointLayerArray associated with a tripleg
 * @param tripleg - the tripleg upvoted for removal
 */
function removePolylinePoints(tripleg){

    for (var i=0; i< pointLayerArray.length;i++){
        if (pointLayerArray[i].id==tripleg.triplegid){
            for (var x in pointLayerArray[i].listOfPoints){
                map.removeLayer(pointLayerArray[i].listOfPoints[x]);
            }
            pointLayerArray.splice(i,1);
        }
    }

}

/**
 * Draws a point belonging to the point layer with the corresponding icon
 * @param point - the point from the current trip's current trip leg
 * @param map - the map container
 * @param type - can be 'regular', 'transition', 'start' or 'stop'
 */
function drawPoint(point,map,type, triplegid){
    var pointLayer;

    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "popupContent": triplegid
        },
        "geometry": {
            "type": "Point",
            "coordinates": [point.lon,point.lat]
        }
    };

    if (type=='regular'){
        console.log(point.addedByUser);
        if (point.addedByUser!=undefined)
        {
            console.log('passed undefined filter');
            pointLayer = L.geoJson(geojsonFeature, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {draggable:true, icon:editIcon})
                    .on('dragend', function(event){
                        var oldLat = event.target.feature.geometry.coordinates[1];
                        var oldLon = event.target.feature.geometry.coordinates[0];

                        console.log(triplegid);

                        var newLat = event.target._latlng.lat;
                        var newLon = event.target._latlng.lng;

                        updateAddTriplegGeometry(triplegid,oldLat,oldLon,newLat,newLon);
                        updateDistance(triplegid);
                    })
                    .on('contextmenu', function(event){
                        console.log(event);
                        var lat = event.latlng.lat;
                        var lon = event.latlng.lng;
                        updateRemoveTriplegGeometry(triplegid,lat,lon);
                        updateDistance(triplegid);
                    });
            }
        });
        }
        else
        {
            pointLayer = L.geoJson(geojsonFeature, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            });
        }
    }

    if (type=='transition'){
        pointLayer = L.geoJson(geojsonFeature, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon : transitionIcon});
            }
        });
    }

    if (type=='start'){
        pointLayer = L.geoJson(geojsonFeature, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon : startIcon, triplegid: triplegid});
            }
        });
    }

    if (type=='stop'){
        pointLayer = L.geoJson(geojsonFeature, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon : stopIcon, triplegid: triplegid});
            }
        });
    }

    pointLayer.addTo(map);



    pointLayer.on('click', function onClickPoint(e){
        if (type=='start'){
            $('html, body').animate({
                scrollTop: $('#firstTimelineElement').offset().top-60
            }, 'slow');


        }
        else
        if (type=='stop') {
            $('html, body').animate({
                scrollTop: $('#lastTimelineElement').offset().top-60
            }, 'slow');
            document.getElementById('stopPoint').checked = true;
            /*document.getElementById('stopPointSv').checked = true;*/
            if (currentTrip.next_trip_start == null) {
                document.getElementById('deletePoint').disabled = true;
                /*document.getElementById('deletePointSv').disabled = true;*/
                document.getElementById('transitionPoint').disabled = true;
                /*document.getElementById('transitionPointSv').disabled = true;*/
                document.getElementById('regularPoint').disabled = true;
                /*document.getElementById('regularPointSv').disabled = true;*/
            }
            else{
                var nextTime = currentTrip.next_trip_start;
                var thisTime = new Date(currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time);
                document.getElementById('timeOfStopPeriod').innerHTML='Period: '+ getPointFormatedDate(thisTime)+" - "+getPointFormatedDate(new Date(nextTime));
                document.getElementById('isStop').checked =true;
                /*document.getElementById('isStopSv').checked =true;*/
                //$('#selectedStopPeriodModal').data('point',point);
                $('#selectedStopPeriodModal').data('tripid',currentTrip.tripid);
                //$('#selectedStopPeriodModal').data('oldType',type);
                $('#selectedStopPeriodModal').modal('show');
            }
        }
        else
        if (type!='transition')
        {
            $('#selectedPointModal').data('point',point);
        $('#selectedPointModal').data('triplegid',triplegid);
        $('#selectedPointModal').data('oldType',type);

            var timeOfPoint = new Date(point.time);
        console.log('triplegid '+triplegid+' type '+type+' '+point.time);

            //if (getLanguage()=="en")
                document.getElementById('timeOfPoint').innerHTML='Time: '+getPointFormatedDateLong(timeOfPoint);
            /*else
                document.getElementById('timeOfPoint').innerHTML='Tid: '+getPointFormatedDateLongSv(timeOfPoint);*/
            document.getElementById('deletePoint').disabled=false;
            /*document.getElementById('deletePointSv').disabled=false;*/
            document.getElementById('transitionPoint').disabled=false;
            /*document.getElementById('transitionPointSv').disabled=false;*/
            document.getElementById('stopPoint').disabled=false;
            /*document.getElementById('stopPointSv').disabled=false;*/


        if (type=='start'||type=='stop'){
            document.getElementById('deletePoint').disabled=true;
            /*document.getElementById('deletePointSv').disabled=true;*/
        }
        else{
            document.getElementById('deletePoint').disabled=false;
            /*document.getElementById('deletePointSv').disabled=false;*/
        }

        if (type=='transition') {
            document.getElementById('transitionPoint').checked=true;
            /*document.getElementById('transitionPointSv').checked=true;*/
        }
        if (type=='regular'||type=='start') {
            document.getElementById('regularPoint').checked=true;
            /*document.getElementById('regularPointSv').checked=true;*/
        }

        $('#selectedPointModal').modal('show');
        }
        else{
            var nextTime = 0;
            for (var j in currentTrip.triplegs) if (currentTrip.triplegs[j].triplegid==triplegid) nextTime = currentTrip.triplegs[j].points[currentTrip.triplegs[j].points.length-1].time;
            document.getElementById('timeOfPeriod').innerHTML='Period: '+getPointFormatedDate(new Date(point.time))+" - "+getPointFormatedDate(new Date(nextTime));
            document.getElementById('isTransition').checked =true;
            /*document.getElementById('isTransitionSv').checked =true;*/
            $('#selectedTransitionPeriodModal').data('point',point);
            $('#selectedTransitionPeriodModal').data('triplegid',triplegid);
            $('#selectedTransitionPeriodModal').data('oldType',type);
            $('#selectedTransitionPeriodModal').modal('show');
        }
    });

    if (type == 'start'){
        pointLayer.on('mouseover', function(e){document.getElementById('firstTimelinePanel').style.border = "5px solid #d4d4d4";});
        pointLayer.on('mouseout', function(e){document.getElementById('firstTimelinePanel').style.border = "1px solid #d4d4d4";});
    }
    else
    if (type== 'stop'){
        pointLayer.on('mouseover', function(e){document.getElementById('lastTimelinePanel').style.border = "5px solid #d4d4d4";});
        pointLayer.on('mouseout', function(e){document.getElementById('lastTimelinePanel').style.border = "1px solid #d4d4d4";});
    }
    else
    if (type == 'transition'){
        console.log(triplegid);
        pointLayer.on('mouseover', function(e){
            document.getElementById('tldate'+ e.layer.feature.properties.popupContent).style.border = "5px solid #212121";});
        pointLayer.on('mouseout', function(e){
            document.getElementById('tldate'+ e.layer.feature.properties.popupContent).style.border = "3px solid #212121";});
    }


    pointLayerArray[pointLayerArray.length-1].listOfPoints.push(pointLayer);


}

function getPointFormatedDate(date){
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    hours = hours < 10 ? '0'+ hours: hours;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;

    var strTime = hours + ':' + minutes + ':' + seconds+' ';
    return strTime;
}

function getPointFormatedDateLongSv(date) {

    var currentTripStartDateLocal = days_sv[new Date(date).getDay()]+", "+new Date(date).format("Y-m-d");
    // var currentTripStartHour = new Date(currentTripStartDate).format("H:i");

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();


    hours = hours < 10 ? '0'+ hours: hours;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;

    var strTime = '('+currentTripStartDateLocal+')'+ hours + ':' + minutes + ':' + seconds+' ';
    return strTime;
}

function getPointFormatedDateLong(date) {

    var currentTripStartDateLocal = days[new Date(date).getDay()]+", "+new Date(date).format("Y-m-d");
    // var currentTripStartHour = new Date(currentTripStartDate).format("H:i");

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();


    hours = hours < 10 ? '0'+ hours: hours;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;

    var strTime = '('+currentTripStartDateLocal+')'+ hours + ':' + minutes + ':' + seconds+' ';
    return strTime;
}

/**
 * Generates a polyline of a tripleg
 * @param tripleg - the tripleg that contains the polyline
 * @param map - the map container
 * @param i - the index of the tripleg within the current trip
 */
function generatePolyline(tripleg, map, i, first){
    var polyline = [];
    pointLayerArray[pointLayerArray.length]={};
    pointLayerArray[pointLayerArray.length-1].id = tripleg.triplegid;
    pointLayerArray[pointLayerArray.length-1].listOfPoints=[];

    console.log(tripleg);
    //ACTIVE TRIPLEG

    if (tripleg.type_of_tripleg==1){

    for (var j in tripleg.points){
        var derivedPoint = L.latLng(tripleg.points[j].lat,tripleg.points[j].lon);
        polyline.push(derivedPoint);

        if (j!=tripleg.points.length-1 && j!=0)
        {
            //NOT the first and not the last
            drawPoint(tripleg.points[j],map,'regular', tripleg.triplegid);
        }
        else
        if (currentTrip.triplegs.length==1){
            // DRAW FIRST AND LAST
            console.log('isnt this the case?');
            if (j==0) drawPoint(tripleg.points[j],map,'start',tripleg.triplegid);
            if (j==currentTrip.triplegs[i].points.length-1) drawPoint(tripleg.points[j],map,'stop',tripleg.triplegid);
        }
        else{
            /*// j is last point or first point of the trip leg
            if (i!=currentTrip.triplegs.length-1 && i!=0){
                // i is not the last or first trip leg -> draw transition
                if(j!=0)
                drawPoint(tripleg.points[j],map,'transition',tripleg.triplegid);
            }
            else*/{
                if (i==0 && j==0){
                    //first trip first icon
                    drawPoint(tripleg.points[j],map,'start',tripleg.triplegid);
                }

                /*else
                if (i==0 && j==tripleg.points.length-1){
                    //first trip first icon
                    drawPoint(tripleg.points[j],map,'transition',tripleg.triplegid);
                }
*/
                if (i==currentTrip.triplegs.length-1 && j==tripleg.points.length-1){
                    drawPoint(tripleg.points[j],map,'stop',tripleg.triplegid);
                }

                /*if (currentTrip.triplegs.length==2){
                    if (i==0 && j==tripleg.points.length-1){
                        drawPoint(tripleg.points[j],map,'transition',tripleg.triplegid);
                    }
                }*/
            }
        }

    }
    var polylineColor = getColor(tripleg.mode);
    var polylineLayer = L.polyline(polyline, {color: polylineColor, weight:8, opacity:0.6}).addTo(map);

    }

    else{

        console.log('drawing passive tripleg '+tripleg.triplegid);
        // PASSIVE TRIPLEGS
        if (tripleg.points == null){
            tripleg.points =[];

            console.log(getNextPassiveTripleg(tripleg.triplegid));

            console.log(getPrevPassiveTripleg(tripleg.triplegid));

            console.log(currentTrip.triplegs);

            // if (currentTrip.triplegs[getPrevPassiveTripleg(tripleg.triplegid)]!=undefined)
                tripleg.points.push(jQuery.extend(true,{},getPrevPassiveTripleg(tripleg.triplegid).points[getPrevPassiveTripleg(tripleg.triplegid).points.length-1]))
                tripleg.points.push(jQuery.extend(true,{},getNextPassiveTripleg(tripleg.triplegid).points[0]));

            // tripleg.points[0] = tripleg.from_time;
        }
        for (var j in tripleg.points) {

            var derivedPoint = L.latLng(tripleg.points[j].lat, tripleg.points[j].lon);
            polyline.push(derivedPoint);
            if ((j==0) || (j==tripleg.points.length-1)){
                drawPoint(tripleg.points[j],map,'transition',tripleg.triplegid);
            }
        }

        /*if (tripleg.points.length==1) { getPrevPassiveTripleg(tripleg.triplegid).points.push(getNextPassiveTripleg(tripleg.triplegid).points[0]);
                                        redrawOnly(getPrevPassiveTripleg(tripleg.triplegid));}*/

            var polylineColor = 'black';
            var polylineLayer = L.polyline(polyline, {color: polylineColor, weight:8, opacity:0.6, dashArray:'20,15'}).addTo(map);

    }
    /*if (tripleg.type_of_tripleg==1) {
        polylineColor = getColor(tripleg.mode);
        polylineLayer = L.polyline(polyline, {color: polylineColor, weight:8, opacity:0.6}).addTo(map);
    }
    else*/

    console.log(tripleg);
    console.log(pointLayerArray);
    console.log(polylineColor);



    //polylineLayer.id = tripleg.triplegid;

    plotlayers[polylineLayer._leaflet_id] = polylineLayer;

    correspondingTimeline[polylineLayer._leaflet_id] = tripleg.triplegid;
    correspondingPolyline[tripleg.triplegid] = polylineLayer._leaflet_id;

    map.addLayer(polylineLayer);
    polylineLayer.bringToBack();


    /**
     * DESKTOP ONLY EVENTS
     */

    if (tripleg.type_of_tripleg==1)
    {polylineLayer.on('mouseover', highlightFeature);
    polylineLayer.on('mouseout', resetHighlight);
    polylineLayer.on('click', scrollToTimeline);

    polylineLayer.on('dblclick', addPointToPolyline);}
    else
    {
        polylineLayer.on('mouseover', highlightPassiveFeature);
        polylineLayer.on('mouseout', resetPassiveHighlight);
        polylineLayer.on('click', scrollToPassiveTimeline);
    }

    if (first){
        //var layer = plotlayers[correspondingPolyline[tripleg.triplegid]];
        map.fitBounds(polylineLayer);
    }
}



function addPointToPolyline(e) {
    var layer = e.target;

    var newPointLatLng = e.latlng;

//    console.log(e);
//    console.log(e.target);

    var prevLatLng = e.target._latlngs[0];
    var nextLatLng = e.target._latlngs[1];

//   console.log(prevLatLng);
//    console.log(nextLatLng);

    //get corresponding points from the trip leg
//   console.log(correspondingTimeline[layer._leaflet_id]);

    for (var i in currentTrip.triplegs){
        if (currentTrip.triplegs[i].triplegid==correspondingTimeline[layer._leaflet_id])
        {
          //  console.log("Before calling function");
          //  console.log(currentTrip.triplegs[i]);
            try {
                logFrontEndOperation(userId,'add point to tripleg');
                addPointToTripleg(newPointLatLng, currentTrip.triplegs[i], correspondingTimeline[layer._leaflet_id]);
            }
            catch(exception) {
                logError(userId, exception, serverResponse);
            }
          //  console.log("After calling function");
          //  console.log(currentTrip.triplegs[i]);

            }
        }
}


function updateAddTriplegGeometry(triplegid,oldLat,oldLon,newLat,newLon){
    for (var i in currentTrip.triplegs){
        if (currentTrip.triplegs[i].triplegid==triplegid){
            for (var j in currentTrip.triplegs[i].points){
                if (currentTrip.triplegs[i].points[j].lat == oldLat && currentTrip.triplegs[i].points[j].lon == oldLon){
                    //currentTrip.triplegs[i].points[j].lat = newLat;
                    //currentTrip.triplegs[i].points[j].lon = newLon;

                    var updateObject = {};
                    updateObject.updatedPoint= currentTrip.triplegs[i].points[j];
                    updateObject.newLat = newLat;
                    updateObject.newLon = newLon;

                    try {
                    updateTripleg(currentTrip.triplegs[i], "updatePointGeometry", updateObject);
                    }
                    catch (exception) {
                        logError(userId, exception ,serverResponse);
                    }
                    updatePolyline(triplegid);
                }
            }
        }
    }

}

function updateRemoveTriplegGeometry(triplegid,lat,lon){
    for (var i in currentTrip.triplegs){
        if (currentTrip.triplegs[i].triplegid==triplegid){
            for (var j in currentTrip.triplegs[i].points){
                if (currentTrip.triplegs[i].points[j].lat == lat && currentTrip.triplegs[i].points[j].lon == lon){
                    var updateObject = {};
                    //updateObject.updatedPoint = currentTrip.triplegs[i].points[j];

                    try {
                        updateTripleg(currentTrip.triplegs[i], "deletePoint", j);
                    }
                    catch (exception) {
                            logError(userId, exception ,serverResponse);
                        }

                    updatePolyline(triplegid);
                }
            }
        }
    }

}

function mergeWithNext(triplegid){
    logFrontEndOperation(userId,'called delete tripleg glyphicon');
    $('#transitionDeleteModal').data('triplegid',triplegid);
    $('#transitionDeleteModal').modal('show');
    console.log(triplegid);
}

function mergeTripleg(triplegid){

    logFrontEndOperation(userId,'decided to merge triplegs');
    $('#transitionDeleteModal').modal('hide');

    console.log('merging tripleg '+triplegid);
   // console.log(currentTrip);

    console.log(triplegid);

    var triplegThatStays;
    var idxOfStay = 0;
    var passiveTriplegToMerge;
    var neighborTriplegToMerge;

    var removeFirst = true;
    for (var i=0; i<currentTrip.triplegs.length;i++)
    {
        if (currentTrip.triplegs[i].triplegid==triplegid){
            if (currentTrip.triplegs[i].type_of_tripleg==0){
                triplegThatStays = currentTrip.triplegs[i-1];
                passiveTriplegToMerge = currentTrip.triplegs[i];
                neighborTriplegToMerge = currentTrip.triplegs[i+1];
                console.log("I AM HERE");
                console.log(i);
                idxOfStay = parseInt(i-1);
                console.log(idxOfStay);
            }
            else {
                triplegThatStays = currentTrip.triplegs[i];
                passiveTriplegToMerge = currentTrip.triplegs[i+1];
                neighborTriplegToMerge = currentTrip.triplegs[i+2];
                console.log("I AM NOW AT "+i-1);
                idxOfStay = i;
            }

            for (var j in passiveTriplegToMerge.points){
                //if (!removeFirst){
                var point = jQuery.extend(true,{}, passiveTriplegToMerge.points[j]);
                /*point.id = currentTrip.triplegs[i+2].points[j].id;
                point.lat = currentTrip.triplegs[i+2].points[j].lat;
                point.lon = currentTrip.triplegs[i+2].points[j].lon;
                point.time = currentTrip.triplegs[i+2].points[j].time;*/
                triplegThatStays.points.push(point);
                //}
                //removeFirst=false;
                /*console.log(currentTrip.triplegs[i+1].points[parseInt(j-1)]);
                if (currentTrip.triplegs[i+1].points[parseInt(j-1)]!=undefined){
                    if (currentTrip.triplegs[i+1].points[j].time!=currentTrip.triplegs[i+1].points[j-1].time) currentTrip.triplegs[i].points.push(point);
                }
                else
                {
                    currentTrip.triplegs[i].points.push(point);
                }*/
                console.log(currentTrip.triplegs[i].points);
            }

            for (var j in neighborTriplegToMerge.points){
                //if (!removeFirst){
                var point = jQuery.extend(true,{}, neighborTriplegToMerge.points[j]);
                /*point.id = currentTrip.triplegs[i+2].points[j].id;
                 point.lat = currentTrip.triplegs[i+2].points[j].lat;
                 point.lon = currentTrip.triplegs[i+2].points[j].lon;
                 point.time = currentTrip.triplegs[i+2].points[j].time;*/
                triplegThatStays.points.push(point);
            }
        }
    }

    console.log(triplegThatStays);
    console.log(neighborTriplegToMerge);
    console.log(passiveTriplegToMerge);


    console.log(currentTrip);

    try {
        removeTripleg(neighborTriplegToMerge.triplegid);
        pushTriplegModification(null, neighborTriplegToMerge, 'delete', currentTrip.tripid);
    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }

    passiveTriplegToMerge.points=[];

    try {
        redrawOnly(passiveTriplegToMerge);
    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }


    console.log("REMOVING SOMETHING "+currentTrip.triplegs.length);

    for (var j=0; j< currentTrip.triplegs.length;j++){
        console.log("Removing "+neighborTriplegToMerge.triplegid+" AND "+passiveTriplegToMerge.triplegid);
        if (currentTrip.triplegs[j].triplegid == passiveTriplegToMerge.triplegid)
        {
            try{
            pushTriplegModification(null, currentTrip.triplegs[j], 'delete', currentTrip.tripid);
            currentTrip.triplegs.splice(j,1);
            j--;
            console.log("Removed "+passiveTriplegToMerge.triplegid);}
            catch (exception){
                logError(userId,exception,serverResponse);
            }
        }
        if (currentTrip.triplegs[j].triplegid == neighborTriplegToMerge.triplegid){
            try{
            pushTriplegModification(null, currentTrip.triplegs[j], 'delete', currentTrip.tripid);
            currentTrip.triplegs.splice(j,1);
            console.log("Removed "+neighborTriplegToMerge.triplegid);
            j--;}
            catch (exception){
                logError(userId,exception,serverResponse);
            }
        }
    }

    console.log(currentTrip);

    try {
        updateRemoveRedraw(triplegThatStays);
        pushTriplegModification(null, triplegThatStays, 'upsert', currentTrip.tripid);
    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }
/*    updatePolyline(triplegid);
    updateTransitionPanel(triplegid);
    updateDistance(triplegid);*/

}

function mergeTriplegWithPrevious(triplegid){

    console.log('merge with prev '+triplegid);

    var newTriplegId;

    for (var i=0; i<currentTrip.triplegs.length;i++)
    {
        if (currentTrip.triplegs[i].triplegid==triplegid){
            console.log(currentTrip.triplegs[i]);
            console.log(currentTrip.triplegs);
            console.log(currentTrip.triplegs[i-1]);
            newTriplegId=currentTrip.triplegs[i-1].triplegid;
        }
    }


    for (var i=0; i<currentTrip.triplegs.length;i++)
    {
        if (currentTrip.triplegs[i].triplegid==newTriplegId){
            neighborTripleg=currentTrip.triplegs[i+1].triplegid;
            for (j in currentTrip.triplegs[i+1].points){
                var point = new Object();
                point.id = currentTrip.triplegs[i+1].points[j].id;
                point.lat = currentTrip.triplegs[i+1].points[j].lat;
                point.lon = currentTrip.triplegs[i+1].points[j].lon;
                point.time = currentTrip.triplegs[i+1].points[j].time;
                currentTrip.triplegs[i].points.push(point);
            }
        }
    }


    removeTripleg(neighborTripleg);

    updatePolyline(newTriplegId);
    updateDistance(newTriplegId);
}

function cancelDeletion(){
    logFrontEndOperation(userId,'decided to cancel tripleg merge');
    $('#transitionDeleteModal').modal('hide');
}

function cancelPointModal(){
    logFrontEndOperation(userId, 'decided to cancel point change');
    $('#selectedPointModal').data('point',null);
    $('#selectedPointModal').data('triplegid',null);
    $('#selectedPointModal').data('oldType',null);

    $('#selectedPointModal').modal('hide');
}

function makeChangesPeriodModal(){

    logFrontEndOperation(userId, 'decided to merge tripleg periods');
    var oldType =$('#selectedTransitionPeriodModal').data('oldType');
    var point = $('#selectedTransitionPeriodModal').data('point');
    var triplegid = $('#selectedTransitionPeriodModal').data('triplegid');

    console.log(triplegid);


    var isTransition = document.getElementById("isTransition").checked || document.getElementById("isTransitionSv").checked ;

    if (!isTransition){
        try{
        mergeTripleg(triplegid);}
        catch (exception){
            logError(userId,exception,serverResponse);
        }
    }

    $('#selectedTransitionPeriodModal').modal('hide');

    $('#selectedTransitionPeriodModal').data('point',null);
    $('#selectedTransitionPeriodModal').data('triplegid',null);
    $('#selectedTransitionPeriodModal').data('oldType',null);
}

function cancelPeriodModal(){
    logFrontEndOperation(userId,'decided to cancel tripleg period change');
    $('#selectedTransitionPeriodModal').modal('hide');

    $('#selectedTransitionPeriodModal').data('point',null);
    $('#selectedTransitionPeriodModal').data('triplegid',null);
    $('#selectedTransitionPeriodModal').data('oldType',null);

}

function makeChangesStopPeriodModal(){

    logFrontEndOperation(userId,'making changes stop period');
  //  var oldType =$('#selectedTransitionPeriodModal').data('oldType');
  //  var point = $('#selectedTransitionPeriodModal').data('point');
    var tripid = $('#selectedStopPeriodModal').data('tripid');

    console.log(tripid);


    var isStop= document.getElementById("isStop").checked || document.getElementById('isStopSv').checked;

    if (!isStop){
        try{
        mergeTrips(tripid);}
        catch (exception){
            logError(userId,exception,serverResponse);
        }
    }

    $('#selectedStopPeriodModal').modal('hide');

    $('#selectedStopPeriodModal').data('point',null);
    $('#selectedStopPeriodModal').data('triplegid',null);
    $('#selectedStopPeriodModal').data('oldType',null);
}

function cancelStopPeriodModal(){
    logFrontEndOperation(userId,'canceling changes stop period');
    $('#selectedStopPeriodModal').modal('hide');

    //$('#selectedTransitionPeriodModal').data('point',null);
    $('#selectedStopPeriodModal').data('tripid',null);
    //$('#selectedTransitionPeriodModal').data('oldType',null);

}


function makeChangesPointModal(){

    logFrontEndOperation(userId,'decided to change point type');

    var oldType =$('#selectedPointModal').data('oldType');
    var point = $('#selectedPointModal').data('point');
    var triplegid = $('#selectedPointModal').data('triplegid');

    var regularChecked = document.getElementById("regularPoint").checked; //|| document.getElementById("regularPointSv").checked ;
    var transitionChecked = document.getElementById("transitionPoint").checked ;//|| document.getElementById("transitionPointSv").checked;
    var stopChecked = document.getElementById("stopPoint").checked ;//|| document.getElementById("stopPointSv").checked;
    var startChecked = document.getElementById("startPoint").checked;// || document.getElementById("startPointSv").checked;
    var deleteChecked = document.getElementById("deletePoint").checked; // || document.getElementById("deletePointSv").checked;

    if (oldType=='transition' && transitionChecked)
    {
        $('#selectedPointModal').modal('hide');
    }
        else
    if (oldType=='regular' && regularChecked)
    {
        $('#selectedPointModal').modal('hide');
    }
        else
    if (oldType=='stop' && stopChecked)
    {
        $('#selectedPointModal').modal('hide');
    }
        else{
        if (deleteChecked){
            logFrontEndOperation(userId, 'changing point types from '+oldType+' to deleted');
            if (oldType=='regular') {
                //DONE
                updateRemoveTriplegGeometry(triplegid,point.lat,point.lon);
                updateDistance(triplegid);
                $('#selectedPointModal').modal('hide');
            }

            if (oldType=='transition') {
                //DONE

                mergeTripleg(triplegid);
               // updateRemoveTriplegGeometry(triplegid,point.lat,point.lon);
                $('#selectedPointModal').modal('hide');
            }
        }

        if (transitionChecked){
            logFrontEndOperation(userId, 'changing point types from '+oldType+' to transition');
            var id = triplegid;
            var fromDate;
            var toDate;
            var triplegStartDate='';
            var triplegEndDate='';
            var modeFrom;
            var modeTo;

            for (var i=0; i<currentTrip.triplegs.length;i++){
                if (currentTrip.triplegs[i].triplegid==triplegid){
                    var modeArray = currentTrip.triplegs[i].mode;
                    modeArray.sort(compare);
                    modeFrom=modeArray[0].id;
                    modeTo=modeFrom;
                    for (var j=0; j<currentTrip.triplegs[i].points.length-1;j++){
                        if (currentTrip.triplegs[i].points[j].time==point.time){
                            fromDate= point.time;
                            toDate= currentTrip.triplegs[i].points[j+1].time;
                        }
                    }
                }
            }

            if (oldType=='regular') {
                //DONE
                try{
                splitTripLeg(id, fromDate, fromDate, triplegStartDate, triplegEndDate, modeFrom, modeTo); }
                catch (exception){
                    logError(userId,exception,serverResponse);
                }
             //   splitTripLeg
            }
            if (oldType=='stop') {
                try {mergeTrips();
                forceLoad();}
                catch (exception){
                    logError(userId,exception,serverResponse);
                }
                /*insertTransitionAtPoint();*/
            }
            $('#selectedPointModal').modal('hide');
        }
        if(stopChecked){
            logFrontEndOperation(userId, 'changing point types from '+oldType+' to check');
            var id = triplegid;
            var fromDate;
            var toDate;
            var triplegStartDate='';
            var triplegEndDate='';
            var modeFrom;
            var modeTo;

            for (var i=0; i<currentTrip.triplegs.length;i++){
                if (currentTrip.triplegs[i].triplegid==triplegid){
                    var modeArray = currentTrip.triplegs[i].mode;
                    modeArray.sort(compare);
                    modeFrom=modeArray[0].id;
                    modeTo=modeFrom;
                    for (var j=0; j<currentTrip.triplegs[i].points.length;j++){
                        if (currentTrip.triplegs[i].points[j].time==point.time){
                            fromDate= point.time;

                            if (j!=currentTrip.triplegs[i].points.length-1)
                            toDate = currentTrip.triplegs[i].points[j+1].time;
                            else
                            toDate = currentTrip.triplegs[i].points[j].time;
                        }
                    }
                }
            }

            if (oldType=='regular') {
                console.log('calling '+ triplegid +" "+ fromDate+" "+toDate+" "+modeFrom);
                console.log('callsing split trip');
                try{splitTrip(triplegid, fromDate,toDate,modeFrom);}
                catch (exception){
                    logError(userId,exception,serverResponse);
                }
            }

            if (oldType=='transition') {
                console.log('calling split trip');

                try{splitTrip(triplegid, fromDate,toDate,modeFrom);}
                catch (exception){
                    logError(userId,exception,serverResponse);
                }
             //   console.log(currentTrip.triplegs);
            }
        }

        if (startChecked){
            logFrontEndOperation(userId, 'changing point types from '+oldType+' to start');
            var fromTime = point.time;
            //var toTime = currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time);

            console.log(fromTime);
            //console.log(toTime);

            console.log(jQuery.extend(true,{}, currentTrip));

            var triplegToPush={};
            for (var j in currentTrip.triplegs) if (currentTrip.triplegs[j].triplegid == triplegid) {
                try{
                    updateTimeOfTripleg(currentTrip, currentTrip.triplegs[j], fromTime, null, previousTripEndDate.getTime(), nextTripStartDate.getTime());
                    logFrontEndOperation(userId, 'update time of tripleg '+currentTrip.triplegs[j].triplegid);
                }
                catch (exception){
                    logError(userId, exception, serverResponse);
                }

            }
            // $('#transitionChoiceModal'+id).data('fromTime',fromTime);
            $('#selectedPointModal').modal('hide');

        }

        if(regularChecked){
            logFrontEndOperation(userId, 'changing point types from '+oldType+' to regular');
            if (oldType=='transition') {
                //DONE
                try{
                    mergeTripleg(triplegid);
                }
                catch (exception){
                    logError(userId,exception,serverResponse);
                }
                $('#selectedPointModal').modal('hide');

            }
            if (oldType=='stop') {
                try{
                    mergeTrips(triplegid);
                }
                catch (exception){
                    logError(userId,exception,serverResponse);
                }
            }
        }
    }
    console.log(serverResponse.trips);
    $('#selectedPointModal').data('point',null);
    $('#selectedPointModal').data('triplegid',null);
    $('#selectedPointModal').data('oldType',null);
}

function splitTrip(id, fromDate, toDate, mode) {

    // first, split into trip legs

    // Splitting previous tripleg into two trip legs -> CAUTION : MIGHT HAVE NO POINTS IN BETWEEN TO DRAW A LINE


    toDate = toDate;
    fromDate = fromDate;

    console.log(id);
    console.log(fromDate);
    console.log(toDate);
    console.log(mode);

    var tripLegA = {};
    tripLegA.triplegid = id + 'a';
    tripLegA.points = [];
    tripLegA.places = [];
    tripLegA.type_of_tripleg = 1;

    var tripLegB = {};
    tripLegB.triplegid = id + 'b';
    tripLegB.points = [];
    tripLegB.places = [];
    tripLegB.type_of_tripleg = 1;

    var pushed = false;
    var tripLegIndex = 0;

    for (var i = 0; i < currentTrip.triplegs.length; i++) {
        if (currentTrip.triplegs[i].triplegid == id) {
            tripLegIndex = i;
            for (var j = 0; j < currentTrip.triplegs[i].points.length; j++) {

                console.log(new Date(currentTrip.triplegs[i].points[j].time).format("Y-m-d H:i:s") + '<=' + fromDate);

                if (currentTrip.triplegs[i].points[j].time <= fromDate) {
                    var point = new Object();

                    point.id = currentTrip.triplegs[i].points[j].id;
                    point.lat = currentTrip.triplegs[i].points[j].lat;
                    point.lon = currentTrip.triplegs[i].points[j].lon;
                    point.time = currentTrip.triplegs[i].points[j].time;

                    tripLegA.points.push(point);
                }

                if (currentTrip.triplegs[i].points[j].time >= toDate) {
                    /* if (!pushed){

                     var point = new Object();

                     point.id = tripLegA.points[tripLegA.points.length-1].id;
                     point.lat = tripLegA.points[tripLegA.points.length-1].lat;
                     point.lon = tripLegA.points[tripLegA.points.length-1].lon;
                     point.time = toDate;

                     tripLegB.points.push(point);

                     pushed =  true;
                     }*/

                    var point = new Object();

                    point.id = currentTrip.triplegs[i].points[j].id;
                    point.lat = currentTrip.triplegs[i].points[j].lat;
                    point.lon = currentTrip.triplegs[i].points[j].lon;
                    point.time = currentTrip.triplegs[i].points[j].time;

                    tripLegB.points.push(point);
                }
            }
        }
    }

    console.log(tripLegA);
    console.log(tripLegB);

    // the last geometry of A will have the timestamp of fromData
    tripLegA.points[tripLegA.points.length - 1].time = fromDate;

    tripLegA.places = [];
    tripLegA.places[0] = {};

    tripLegA.mode = [];
    tripLegA.mode[0] = {};
    tripLegA.mode[0].id = mode;
    tripLegA.mode[0].certainty = "100";
    tripLegA.mode = tripLegA.mode.concat(getRestOfModes(mode));

    // the first geometry of B should be same as the last one of A

    var firstPointOfB = new Object();

    if (tripLegB.points[0].lat != tripLegA.points[tripLegA.points.length - 1].lat) {
        firstPointOfB.id = tripLegA.points[tripLegA.points.length - 1].id;
        firstPointOfB.time = tripLegA.points[tripLegA.points.length - 1].time;
        firstPointOfB.lat = tripLegA.points[tripLegA.points.length - 1].lat;
        firstPointOfB.lon = tripLegA.points[tripLegA.points.length - 1].lon;

        tripLegB.points.unshift(firstPointOfB);
    }

    console.log(tripLegB);

    tripLegB.mode = [];
    tripLegB.mode[0] = {};
    tripLegB.mode[0].id = mode;
    tripLegB.mode[0].certainty = "100";
    tripLegB.mode = tripLegB.mode.concat(getRestOfModes(mode));

    tripLegB.places = [];
    tripLegB.places[0] = {};

    /*  sanitize(tripLegA);
     sanitize(tripLegB);
     */

    //triplegA becomes the last tripleg of current trip

    //replace original tripleg with the two triplegs


    if (tripLegB.points.length > 1) {
        console.log("deleting tripleg " + tripLegIndex + " and adding triplegs " + tripLegA.triplegid + " and " + tripLegB.triplegid);

        pushTriplegModificationReplace(currentTrip.triplegs[tripLegIndex], tripLegA, currentTrip.tripid, tripLegB);

        // pushTriplegModification(null, currentTrip.triplegs[tripLegIndex], "delete", currentTrip.tripid);
        // pushTriplegModification(null, tripLegA, "upsert", currentTrip.tripid);
        // pushTriplegModification(null, tripLegB, "upsert", currentTrip.tripid);

        console.log(jQuery.extend(true, {}, tripLegB));

        currentTrip.triplegs.splice(tripLegIndex, 1, tripLegA, tripLegB);
        console.log(jQuery.extend(true, {}, currentTrip));

    }
    else {
        console.log("deleting tripleg " + tripLegIndex + " and replacing it with " + tripLegA.triplegid);
        //pushTriplegModification(null, currentTrip.triplegs[tripLegIndex], "delete", currentTrip.tripid);
        //pushTriplegModification(null, tripLegA, "upsert",currentTrip.tripid);

        pushTriplegModificationReplace(currentTrip.triplegs[tripLegIndex], tripLegA, currentTrip.tripid);

        currentTrip.triplegs.splice(tripLegIndex, 1, tripLegA);
    }
}

function continueWithRequest(tripLegA,tripLegB){
    var oldVersionOfCurrentTrip = jQuery.extend(true, {}, currentTrip);

    var tripIndex =  getNextPassiveTrip(currentTrip.tripid);
    if (tripIndex<0) tripIndex = getNextTrip(currentTrip.tripid);

    var newTrip = jQuery.extend({}, currentTrip);
    newTrip.triplegs=[];
    newTrip.defined_by_user = undefined;

    //current trip becomes triplegA only
    currentTrip.next_trip_start = tripLegB.points[0].time;
    currentTrip.destination_places=[];
    currentTrip.destination_places[0]={};
    //update last time end

    // new trip starts at triplegb
    var newFooObj = currentTrip.tripid+"a";
//    newFooObj = currentTrip.tripid+"a";
    console.log("PREVIOUS TRIP END "+tripLegA.points[tripLegA.points.length-1].lat+" , "+tripLegA.points[tripLegA.points.length-1].lon);
    newTrip.tripid=getNewTripId(newFooObj);
    newTrip.prev_trip_stop = tripLegA.points[tripLegA.points.length-1].time;
    newTrip.prev_trip_place=[];
    newTrip.prev_trip_place[0]={};
    newTrip.type_of_trip = 1;

    var newPassiveTrip = jQuery.extend(true, {}, currentTrip);
    newPassiveTrip.tripid = currentTrip.tripid+"p"+newTrip.tripid;
    newPassiveTrip.type_of_trip = 0;
    newPassiveTrip.triplegs = [];
    // the points in between trips will be stored here
    newPassiveTrip.triplegs[0] = {};
    newPassiveTrip.triplegs[0].points = [];
    newPassiveTrip.defined_by_user = undefined;

    var triplegUpdateRequest = null;
    for (var i = currentTrip.triplegs.length-1; i>=0; i--){
        console.log(new Date(currentTrip.triplegs[i].points[0].time)+'>='+new Date(tripLegB.points[0].time));

        if (new Date(currentTrip.triplegs[i].points[0].time)>=new Date(tripLegB.points[0].time)){
            newTrip.triplegs.splice(0,0,currentTrip.triplegs[i]);
            triplegUpdateRequest = pushTriplegModification(null, currentTrip.triplegs[i], "upsert", newTrip.tripid);
            currentTrip.triplegs.splice(i,1);
            console.log(newTrip);
            console.log(currentTrip);
        }
    }


    console.log("adding "+newTrip.tripid+" at index "+tripIndex);

    console.log(serverResponse);
    var upsertRequest1 = null;
    var upsertRequest2 = null;

    if (triplegUpdateRequest!=null){
        $.when(triplegUpdateRequest).done(function (){
            upsertRequest1 = pushTripModification(oldVersionOfCurrentTrip,currentTrip,"upsert");
            $.when(upsertRequest1).done(function (){
                upsertRequest2 = pushTripModification(oldVersionOfCurrentTrip,newTrip,"upsert", newPassiveTrip);
            });
        });
    }
    else {
        upsertRequest1 = pushTripModification(oldVersionOfCurrentTrip,currentTrip,"upsert");
        $.when(upsertRequest1).done(function (){
            upsertRequest2 = pushTripModification(oldVersionOfCurrentTrip,newTrip,"upsert", newPassiveTrip);
        });
    }
//    currentTrip.next_trip_start
    newPassiveTrip.triplegs[0].points[0] = newTrip.triplegs[0].points[0];

    serverResponse.trips.splice(tripIndex,0,newPassiveTrip, newTrip);
    serverResponse.trips_to_process++;
    console.log(jQuery.extend(true,{},serverResponse));


    // pushTripModification(oldVersionOfCurrentTrip,newTrip,"upsert");

    console.log(serverResponse);

    map.remove();
    generateMap();

    var ul = document.getElementById("timeline");

    ul.innerHTML="";

    console.log(currentTrip);
    generateHTMLElements(currentTrip);
    $('#selectedPointModal').modal('hide');
}

function mergeTrips(id){
    $.when(logFrontEndOperation(userId, 'decided to merge trips').done(function(){

    try {
      console.log(jQuery.extend(true,{},serverResponse));

    var oldVersionOfCurrentTrip = jQuery.extend(true, {}, currentTrip);
    var tripIndex = getNextTrip(currentTrip.tripid);

    console.log(jQuery.extend(true,{}, currentTrip));

    var firstTripleg = true;

    // TODO PUSH TO THE SERVER
    for (var i=0;i<serverResponse.trips[tripIndex].triplegs.length;i++){
        console.log(i);
        if (firstTripleg){
            for (var j = 0; j < serverResponse.trips[tripIndex].triplegs[i].points.length ; j++) {
                currentTrip.triplegs[currentTrip.triplegs.length - 1].points.push(serverResponse.trips[tripIndex].triplegs[i].points[j]);
            }
            console.log('p1a');
            var pushRequest1 = pushTriplegModification(null, currentTrip.triplegs[currentTrip.triplegs.length - 1], "upsert", currentTrip.tripid);

            $.when(pushRequest1).done(function (){
                console.log('p1b');
                console.log(tripIndex);
                console.log(serverResponse);
                console.log(serverResponse.trips[tripIndex]);
                console.log(serverResponse.trips[tripIndex].triplegs);
                console.log(i);
                console.log(serverResponse.trips[tripIndex].triplegs[i]);
                var pushRequest2 = pushTriplegModification(null, serverResponse.trips[tripIndex].triplegs[0], "delete", currentTrip.tripid);
                $.when(pushRequest2).done(function (){
                    console.log('p1C');
                    mergeTripsContinue(oldVersionOfCurrentTrip, tripIndex);
                });
            });


            firstTripleg=false;
        }
        else {
            console.log('p2');
            currentTrip.triplegs.push(serverResponse.trips[tripIndex].triplegs[i]);
            var pushRequest1 =pushTriplegModification(null, currentTrip.triplegs[currentTrip.triplegs.length - 1], "upsert", currentTrip.tripid);

            $.when(pushRequest1).done(function (){
                console.log('p2a');
                         mergeTripsContinue(oldVersionOfCurrentTrip, tripIndex);

            });
        }
        //
    }

    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }
    /* currentTrip.triplegs[currentTrip.triplegs.length-1].places=[];
    currentTrip.triplegs[currentTrip.triplegs.length-1].places[0]={};*/

    }));
}

function mergeTripsContinue(oldVersionOfCurrentTrip, tripIndex){

    try {
        console.log(serverResponse);
        console.log(tripIndex);

        currentTrip.next_trip_start = serverResponse.trips[tripIndex].next_trip_start;
        currentTrip.destination_places = serverResponse.trips[tripIndex].destination_places;
        currentTrip.purposes = serverResponse.trips[tripIndex].purposes;

        //deleting two trips because of the passive trip definition


        console.log(jQuery.extend(true, {}, serverResponse));
        console.log("deletion candidates " + serverResponse.trips[tripIndex - 1].tripid + " , " + serverResponse.trips[tripIndex].tripid);
        console.log("update candidates " + currentTrip.tripid);

        /*for (var i in serverResponse.trips[tripIndex-1].triplegs) pushTriplegModification(null,serverResponse.trips[tripIndex-1].triplegs[i],"delete",currentTrip.tripid);
         for (var i in serverResponse.trips[tripIndex].triplegs) pushTriplegModification(null,serverResponse.trips[tripIndex].triplegs[i],"delete",currentTrip.tripid);for (var i in serverResponse.trips[tripIndex-1].triplegs) pushTriplegModification(null,serverResponse.trips[tripIndex-1].triplegs[i],"delete",currentTrip.tripid);*/

        // delete next passive
        console.log('delete ' + serverResponse.trips[tripIndex - 1].tripid);
        var deleteRequest1 = pushTripModification(oldVersionOfCurrentTrip, serverResponse.trips[tripIndex - 1], "delete");
        // delete next because of merge
        $.when(deleteRequest1).done(function () {
            console.log('delete ' + serverResponse.trips[tripIndex].tripid);
            var deleteRequest2 = pushTripModification(oldVersionOfCurrentTrip, serverResponse.trips[tripIndex], "delete");
            $.when(deleteRequest2).done(function () {

                console.log('upsert ' + currentTrip.tripid);

                serverResponse.trips.splice(tripIndex - 1, 2);

                console.log(jQuery.extend(true, {}, serverResponse));

                map.remove();
                generateMap();

                var ul = document.getElementById("timeline");

                ul.innerHTML = "";


                // generateHTMLElements(currentTrip);

                console.log(currentTrip);


                var deleteRequest3 = pushTripModification(oldVersionOfCurrentTrip, currentTrip, "upsert", serverResponse.trips[getPrevPassiveTrip(currentTrip.tripid)]);
                $.when(deleteRequest3).done(function () {
                    console.log('get next');
                    getNextTripAndAttachToResponse(serverResponse, userId);
                })
            });
        });


        // upsert the new trip


        $('#selectedPointModal').modal('hide');
    }
    catch (exception){
        logError(userId,exception,serverResponse);
    }
}

function getNextTrip(tripid){
    var id=-1;
    for (var j=0; j < serverResponse.trips.length;j++){
        console.log('compare '+serverResponse.trips[j].tripid+'=='+tripid);
        if (serverResponse.trips[j].tripid==tripid)
        {
            // taking into account the passive trip
            if ((serverResponse.trips[j+1].type_of_trip==serverResponse.trips[j].type_of_trip)||(serverResponse.trips[j+1].type_of_trip==serverResponse.trips[j+2].type_of_trip))
                console.log('CONTAMINATED DATA (NEXT TRIP) AT: '+tripid);
            id=j+2;
        }
    }
    return id;
}

function getNextPassiveTrip(tripid){
    var id=-1;
    for (var j=0; j < serverResponse.trips.length;j++){
        if (serverResponse.trips[j].tripid==tripid)
        {
            // taking into account the passive trip
            id=j+1;

        }
    }
    return id;
}

function getPrevPassiveTrip(tripid){
    var id=0;
    for (var j=0; j < serverResponse.trips.length;j++){
        if (serverResponse.trips[j].tripid==tripid)
        {
            // taking into account the passive trip
            id=j-1;
        }
    }
    return id;
}

function getPrevTrip(tripid){
    var id=-1;

    for (var j=0; j < serverResponse.trips.length;j++){
        console.log('comparing '+serverResponse.trips[j].tripid+"=="+tripid);
        if (serverResponse.trips[j].tripid==tripid)
        {
            // taking into account the passive trip
            if ((serverResponse.trips[j-1].type_of_trip==serverResponse.trips[j].type_of_trip)||(serverResponse.trips[j-1].type_of_trip==serverResponse.trips[j-2].type_of_trip))
                console.log('CONTAMINATED DATA (PREV TRIP) AT: '+tripid);

            id=j-2;
        }
    }
    return id;
}

function getPrevTripleg(triplegid){
    var id=0;

    for (var j=0; j < currentTrip.triplegs.length;j++){
        if (currentTrip.triplegs[j].triplegid==triplegid)
        {
            console.log("GOT ID PREV"+j);
            id=j-2;
        }
    }
    return currentTrip.triplegs[id];
}

function getNextTripleg(triplegid){
    var id=0;

    for (var j=0; j < currentTrip.triplegs.length;j++){
        console.log(currentTrip.triplegs[j].triplegid+'=='+triplegid);
        if (currentTrip.triplegs[j].triplegid==triplegid)
        {
            id=j+2;
        }
    }
    return currentTrip.triplegs[id];
}

function getNextPassiveTripleg(triplegid){
    var id=0;

    for (var j=0; j < currentTrip.triplegs.length;j++){
        console.log(currentTrip.triplegs[j].triplegid+'=='+triplegid);
        if (currentTrip.triplegs[j].triplegid==triplegid)
        {
            id=j+1;
        }
    }
    return currentTrip.triplegs[id];
}

function getPrevPassiveTripleg(triplegid){
    var id=0;

    for (var j=0; j < currentTrip.triplegs.length;j++){
        console.log(currentTrip.triplegs[j].triplegid+'=='+triplegid);
        console.log(currentTrip.triplegs[j].triplegid==triplegid);
        if (currentTrip.triplegs[j].triplegid==triplegid)
        {
            id=j-1;
        }
    }

    return currentTrip.triplegs[id];
}

function updateDistance(triplegid){
    if (document.getElementById('distPar'+triplegid)!=null)
    {
        document.getElementById('distPar'+triplegid).innerHTML=' Distance:'+getDistanceOfTripLeg(triplegid);
    }
    else
    {
        console.log(triplegid);
        console.log(getNextTripleg(triplegid));
        console.log(getPrevTripleg(triplegid));
        document.getElementById('distPar'+getNextTripleg(triplegid).triplegid).innerHTML =' Distance:'+getDistanceOfTripLeg(getNextTripleg(triplegid).triplegid);
    }
}

/**
 * Checking whether the trips and triplegs maintain their integrity after modifications / on server request
 */
function integrityCheck(){
    for (var j=1; j<serverResponse.trips.length-1;j++){
        // Checking
        var currentTrip = serverResponse.trips[j];
        var prevTrip = serverResponse.trips[j-1];
        var nextTrip = serverResponse.trips[j+1];
        console.log('checking for time constraints for trip '+currentTrip.tripid);

        if (currentTrip.triplegs[0].points[0].time==prevTrip.triplegs[prevTrip.triplegs.length-1].points[prevTrip.triplegs[prevTrip.triplegs.length-1].points.length-1].time)
            console.log('PASSED time constraint previous')
        else
            console.log('FAIL!!! '+currentTrip.triplegs[0].points[0].time+'=='+prevTrip.triplegs[prevTrip.triplegs.length-1].points[prevTrip.triplegs[prevTrip.triplegs.length-1].points.length-1].time);

        if (currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time==nextTrip.triplegs[0].points[0].time)
            console.log('PASSED time constraint next')
        else
            console.log('FAIL!!! '+currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time+'=='+nextTrip.triplegs[0].points[0].time);

        console.log('checking for type of trips constraints for trip '+currentTrip.tripid);

        if (currentTrip.type_of_trip!=prevTrip.type_of_trip)
            console.log('PASSED prev type of trip')
        else
            console.log('FAIL!!! '+currentTrip.type_of_trip+'<>'+prevTrip.type_of_trip);

        if (currentTrip.type_of_trip!=nextTrip.type_of_trip)
            console.log('PASSED next type of trip')
        else
            console.log('FAIL!!! '+currentTrip.type_of_trip+'<>'+nextTrip.type_of_trip);

        console.log('checking for start and end time for trip '+currentTrip.tripid);
        if (currentTrip.triplegs[0].points[0].time<=currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time)
            console.log('PASSED start and end time of trip')
        else
            console.log('FAIL!!! '+currentTrip.triplegs[0].points[0].time+'<='+currentTrip.triplegs[currentTrip.triplegs.length-1].points[currentTrip.triplegs[currentTrip.triplegs.length-1].points.length-1].time);

        console.log('checking for triplegs constraints for trip '+currentTrip.tripid);

        for (var i=1; i<currentTrip.triplegs.length-1; i++){
            var currentTripleg = currentTrip.triplegs[i];
            var prevTripleg = currentTrip.triplegs[i-1];
            var nextTripleg = currentTrip.triplegs[i+1];

            console.log('checking for time constraints for tripleg '+currentTripleg.triplegid);
            if (currentTripleg.points[0].time==prevTripleg.points[prevTripleg.points.length-1].time)
                console.log('time constraint passed');
            else
                console.log("FAIL!!! "+currentTripleg.points[0].time+'=='+prevTripleg.points[prevTripleg.points.length-1].time);

            if (currentTripleg.points[currentTripleg.points.length-1].time==nextTripleg.points[0].time)
                console.log('second time constraint passed');
            else
                console.log("FAIL!!! "+currentTripleg.points[currentTripleg.points.length-1].time+'=='+nextTripleg.points[0].time);
            console.log('checking for type of triplegs constraints for tripleg '+currentTripleg.triplegid);

            if (currentTripleg.type_of_tripleg!=prevTripleg.type_of_tripleg)
                console.log('prev tripleg type passed');
            else
                console.log('FAIL!!! '+currentTripleg.type_of_tripleg+'<>'+prevTripleg.type_of_tripleg);

            if (currentTripleg.type_of_tripleg!=nextTripleg.type_of_tripleg)
                console.log('next tripleg type passed');
            else
                console.log('FAIL!!! '+currentTripleg.type_of_tripleg+'<>'+nextTripleg.type_of_tripleg);

            console.log('checking for start and end time for tripleg '+currentTripleg.triplegid);
            if (currentTripleg.points[0].time<=currentTripleg.points[currentTripleg.points.length-1].time)
                console.log('start and end time passed');
            else
                console.log('FAIL!!! '+currentTripleg.points[0].time+'<='+currentTripleg.points[currentTripleg.points.length-1].time);

            //TODO ROLLBACK UNTIL CONSISTENT?????
        }

    }
}