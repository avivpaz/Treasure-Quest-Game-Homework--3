var timer; //the timer for counting down time

var navFlag = "off"; //the current navigation flag

var groupName = null; //the name of the group

var userMarker; //user's marker

var map; //current map DOM object

var myPosition; //the position of the user

var imageCount = 1; //the number of images uploaded for that group

//time calculation variables
var future;
var Minutes;
var Seconds;



//when document is ready functions to run
$(document).ready(function () {
    initialize(); // intialize map
});

//set the map height with map page is shown
$(document).on("pageshow", "#mapPage", setMapHeight);

//set the map height with map page is shown
$(document).on("pageshow", "#addPoi", function() {
        document.getElementById("image").src = "";
        document.getElementById("imageUrl").value = "";
        document.getElementById("descriptionPuiTXT").value = "";
        document.getElementById("namePuiTXT").value = "";
});

//Initialize the map
function initialize() {
    clock = 5;
    timer = 0;
    timeInterval = 5000; // in miliseconds
    var mapOptions = {
        zoom: 17
    }
    var mapObj = document.getElementById("map");
    map = new google.maps.Map(mapObj, mapOptions); // create the map object
    getMyPosition(); // get the position of the user
}

//-----------------------------------------------------------------------
// get the user's position
//-----------------------------------------------------------------------
function getMyPosition() {
    // Try HTML5 geolocation
    if (navigator.geolocation) {
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000
        };
        navigator.geolocation.getCurrentPosition(function (position) {
            //get current position
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);   
            if (document.getElementById("groupNameTB").value != "")                                
                setPathPoint(position.coords.latitude, position.coords.longitude, document.getElementById("groupNameTB").value);                     
            if (myPosition == null || myPosition.nb != pos.nb || myPosition.ob != pos.ob) {
                myPosition = pos;
                setUserMarker(pos);
                map.setCenter(pos); // center the map around the position of the user
            }
        }, function () {
            // in case of failure of getCurrentPosition
            handleNoGeolocation(true);
        }, options);
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
}

//Set the user marker in a given positino
function setUserMarker(pos) {
    var image = "images/man_small.png"; //the image of the user
    //remove current marker if present
    if (userMarker != null)
        userMarker.setMap(null);
    userMarker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'You Are Here',
        icon: image
    });
}

//----------------------------------------------------------------------------------
// function that is called in case there is no GeoLocation
//----------------------------------------------------------------------------------
function handleNoGeolocation(errorFlag) {
    alert("failed to locate your device");
    stopNavigation(true);
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }
    alert(content);
}


//-----------------------------------------------------------------------
// start the navigation
//-----------------------------------------------------------------------
function startNavigation() {
    if (navFlag == "off" || navFlag == "pause") {
        if (document.getElementById("groupNameTB").value == "") {
            alert("חובה להזין שם קבוצה");
            return;
        }
        groupName = document.getElementById("groupNameTB").value;
        navFlag = "on";
        // clear the user display labels
        setNavigationButtonValue("הפסק");
        timer = setInterval("getMyPosition()", timeInterval); // run the getPosition every timeInterval miliseconds
    }
    else {  // stop the navigation
        stopNavigation(true)
    }
}

//-----------------------------------------------------------------------
// stop the navigation
//-----------------------------------------------------------------------
function stopNavigation(clearTimer) {
    if (timer != null)
        clearInterval(timer); // will stop the running thread
    navFlag = "off";
    setNavigationButtonValue("התחל");
    if (clearTimer)
    {
        $("#timeSplitter").text("");
        $("#seconds").text("");
        $("#minutes").text("");
    }
}

//function for setting the clock
function time() {
    setInterval(function () {
        if (navFlag == "on") {
            var now = new Date();
            var difference = Math.floor((future.getTime() - now.getTime()) / 1000);
            future1 = new Date();
            var seconds = fixIntegers(difference % 60);
            difference = Math.floor(difference / 60);
            var minutes = fixIntegers(difference % 60);
            difference = Math.floor(difference / 60);
            $("#timeSplitter").text(":");
            $("#seconds").text(seconds);
            $("#minutes").text(minutes);
            Minutes = minutes;
            Seconds = seconds;
            if (minutes == 0 && seconds == 0) {
                alert("הניווט הופסק");
                stopNavigation(true);
            }
        }
    }, 1000);
}

//-----------------------------------------------------------------------
// fixing the time 
//-----------------------------------------------------------------------
function fixIntegers(integer) {
    if (integer < 0)
        integer = 0;
    if (integer < 10)
        return "0" + integer;
    return "" + integer;
}

//this function controls the start\stop\continue navigation button states
function navigationButtonClicked() {    
    if (navFlag == "off") {
        future = new Date();
        future.setMinutes(future.getMinutes() + 5);
    }
    else if (navFlag == "pause") {
        future = new Date();
        future.setMinutes(future.getMinutes() + (Minutes * 1));
        future.setSeconds(future.getSeconds() + (Seconds * 1));
    }
    getMyPosition();
    startNavigation(true);
    time();
}

//this function will run when service button will be clicked
function serviceButtonClicked() {
    var retVal = prompt("נא תכניס את הרדיוס המבוקש(50,000 הכי גבוה):");
    service = new google.maps.places.PlacesService(map);
    google.maps.event.addListenerOnce(map, 'bounds_changed', performSearch(retVal));    
    stopNavigation(false);
    setNavigationButtonValue("המשך");
    navFlag = "pause";
    
}

//this function will run when create poi button is clocked
function poiButtonClicked() {
    if (navFlag != "on") {
        alert("חובה להתחיל לנווט בשביל להוסיף נקודות עניין");
        return;
    }
    $.mobile.changePage($("#addPoi"), "none");
}

//get current location and create a new POI
function createPoi() {
    groupName = document.getElementById("groupNameTB").value;
    name = document.getElementById("namePuiTXT").value;
    description = document.getElementById("descriptionPuiTXT").value;
    if (groupName == "" || name == "" || description == "") {
        alert("אנא מלא שם קבוצה, שם נקודה ותיאור");
        return;
    }
    navigator.geolocation.getCurrentPosition(createPoint);
}

//Creates a poi from current location
function createPoint(position) {
    pointPoi = new Object();
    pointPoi.latitude = position.coords.latitude;
    pointPoi.longitude = position.coords.longitude;
    pointPoi.groupName = document.getElementById("groupNameTB").value;
    pointPoi.name = document.getElementById("namePuiTXT").value;
    pointPoi.description = document.getElementById("descriptionPuiTXT").value;
    pointPoi.imageUrl = document.getElementById("imageUrl").value;
    //save to db
    savePOI(pointPoi);
}

// ----------- set poi in the DB-----------
function savePOI(poiPoint) {
    var dataString = '{lat:' + pointPoi.latitude + ',' + 'lng:' + pointPoi.longitude + ',' + 'groupName:"' + poiPoint.groupName + '",' + 'name:"' + poiPoint.name + '",' + 'description:"' + pointPoi.description + '",' + 'imageUrl:"' + pointPoi.imageUrl + '"}';
    Load();
    $.ajax({ // ajax call starts 
        //url: '../TreasureAjax.asmx/setPOI',   // server side method
        url: 'http://proj.ruppin.ac.il/bgroup16/mobile/tar3/TreasureAjax.asmx/setPOI',   // server side method
        data: dataString,    // the parameters sent to the server
        type: 'POST',
        dataType: 'json', // Choosing a JSON datatype
        contentType: 'application/json; charset = utf-8',
        success: function (data) // Variable data contains the data we get from serverside
        {
            addPoiMarker(poiPoint);
            UnLoad();
            $.mobile.changePage($("#mapPage"), "none");
        }, // end of success
        error: function (e) {
            UnLoad();
            alert("failed in setPOI :( " + e.responseText + ")");
        } // end of error
    }) // end of ajax call
}

//add a new market to map
function addPoiMarker(poiPoint) {
    new google.maps.Marker({
        position: new google.maps.LatLng(poiPoint.latitude, poiPoint.longitude),
        map: map,
        title: poiPoint.name,
        icon: "images/blue-dot.png"
    });
}

// --------search places around------------------
function performSearch(userRadius) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
        var request = {
            location: pos,
            radius: userRadius,
            keyword: 'best view',
            keyword: 'hospital',
        };
        service.radarSearch(request, callback);
    });
}

function callback(results, status) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
        return;
    }
    for (var i = 0, result; result = results[i]; i++) {
        createMarker(result);
    }
}

function createMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: {
            // Star
            path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
            fillColor: '#ffff00',
            fillOpacity: 1,
            scale: 1 / 4,
            strokeColor: '#bd8d2c',
            strokeWeight: 1
        }
    });

    google.maps.event.addListener(marker, 'click', function () {
        service.getDetails(place, function (result, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                alert(status);
                return;
            }
            var infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(result.name);
            infoWindow.open(map, marker);
        });
    });
}

//-----------------------------------------------------------------------
// Send the path point to the server
//-----------------------------------------------------------------------
function setPathPoint(lat, lng, groupName) {    
    var dataString = '{lat:' + lat + ',' + 'lng:' + lng + ',' + 'groupName:"' + groupName + '"}';
    $.ajax({ // ajax call starts
      //  url: '../TreasureAjax.asmx/setPathPoint',   // server side method
       url: 'http://proj.ruppin.ac.il/bgroup16/mobile/tar3/TreasureAjax.asmx/setPathPoint',   // server side method
        data: dataString,    // name without the xml extension
        type: 'POST',
        dataType: 'json', // Choosing a JSON datatype
        contentType: 'application/json; charset = utf-8',
        success: function (data) // Variable data contains the data we get from serverside
        {
        }, // end of success
        error: function (e) {
            alert("failed in setPathPoint :( " + e.responseText);
        } // end of error
    }) // end of ajax call
}

function getPicture() {
    try {
        navigator.camera.getPicture(uploadPhoto,
                                        function (message) { alert('get picture failed'); },
                                        { quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA
                                        }
                                        ); // PhoneGap method for retrieving an image from the phone's camera
    } catch (e) {
        alert("Error: " + e);
    }


} // Get Picture

function uploadPhoto(imageURI) {    
    var options = new FileUploadOptions(); // PhoneGap object to allow server upload
    options.fileKey = "file";
    options.fileName = groupName + imageCount; // file name
    options.mimeType = "image/jpeg"; // file type
    var params = {}; // Optional parameters
    params.value1 = "test";
    params.value2 = "param";
    options.params = params; // add parameters to the FileUploadOptions object
    Load(); // Start the spinning "working" animation
    var ft = new FileTransfer();    
    ft.upload(imageURI, encodeURI("http://proj.ruppin.ac.il/mobile/pg/picUploadServer/ReturnValue.ashx"), win, fail, options); // Upload
} // Upload Photo

function win(r) {
    img = document.getElementById("image");
    img.src = "http://proj.ruppin.ac.il/mobile/pg/picUploadServer/" + groupName + imageCount + ".jpg";
    document.getElementById("imageUrl").value = img.src;
    imageCount++;
    UnLoad(); // Stop "working" animation
} // win (upload success)

function fail(error) {
    UnLoad();
    alert("An error has occurred: Code = " + error.code);
} // fail (upload not successful)

function Load() {
    $.mobile.loading('show', {
        text: "Loading...",
        theme: 'c',
        textVisible: true
    });
} // loading

function UnLoad() {
    $.mobile.loading('hide');
} // Unload

//calculate and set the height of the content for using in google maps div
function setMapHeight() {
    var header = $.mobile.activePage.find("div[data-role='header']:visible");
    var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
    var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
    var viewport_height = $(window).height();

    var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    if ((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
        content_height -= (content.outerHeight() - content.height());
    }
    $('#map').height(content_height);
}

//Set the navigation button value
function setNavigationButtonValue(value) {
    $("#navBTN").val(value);
    $("#navBTN").button("refresh")
}