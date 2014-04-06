var mapObj;
var map;
var infoWindow;
var markers = new Array();
var walkpaths = new Array();

//Show the map
function createMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: new google.maps.LatLng(32.807909, 34.996948)
    });

    infoWindow = new google.maps.InfoWindow();
}

//-----------------------------------------------------------------------
// get the target point
//-----------------------------------------------------------------------
function getPOIList() {
    var groupName = document.getElementById("groupNameTB").value;
    if (groupName == "") {
        alert("Please enter a group name");
        return;
    }
    //clear markers from map
    clearMap();
    var dataString = '{groupName:"' + groupName + '"}';
    $.ajax({ // ajax call starts
        url: '../TreasureAjax.asmx/getPOIList',   // server side method
        data: dataString,    // parameters passed to the server
        type: 'POST',
        dataType: 'json', // Choosing a JSON datatype
        contentType: 'application/json; charset = utf-8',
        success: function (data) // Variable data contains the data we get from server side
        {
            var points = $.parseJSON(data.d);
            if (points.length > 0) {
                for (var i = 0; i < points.length; i++)
                    showPOI(points[i]);
                //center to first marker
                map.panTo(new google.maps.LatLng(points[0].P.Lat, points[0].P.Lng));
                map.setZoom(14);
                //set status line
                updateStatus("Loaded " + points.length + " POI");
                //get the path list
                getPathList(groupName);
            }
            else
                updateStatus("No POI found for that group");
        }, // end of success
        error: function (e) {
            alert("failed in getTarget :( " + e.responseText);
        } // end of error
    }) // end of ajax call
}

//--------------------------------------
// show the POI on the map
//--------------------------------------
function showPOI(poiPoint) {
    var image = "../images/blue-dot.png";
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(poiPoint.P.Lat, poiPoint.P.Lng),
        map: map,
        title: poiPoint.Name,
        icon: image
    });
    markers.push(marker);
    // Listen for click event  
    google.maps.event.addListener(marker, 'click', function () {
        map.setCenter(new google.maps.LatLng(marker.position.lat(), marker.position.lng()));
        map.setZoom(16);
        onItemClick(poiPoint);
    });
}

// Info window trigger function 
function onItemClick(poiPoint) {
    // Create content  
    var contentString = '<div id="infoWindow">';
    contentString += "<center><b>" + poiPoint.Name + "</b></center><br /><br />" + poiPoint.Description + "<br /><hr /><img src=\"" + poiPoint.ImageUrl + "\" width=100px height=100px>";
    contentString += '</div>';
    // Replace our Info Window's content and position 
    infoWindow.setContent(contentString);
    infoWindow.setPosition(new google.maps.LatLng(poiPoint.P.Lat, poiPoint.P.Lng));
    infoWindow.open(map)
}

//clear the map from markers
function clearMap() {
    for (var i = 0; i < markers.length; i++)
        markers[i].setMap(null);
    for (var i = 0; i < walkpaths.length; i++)
        walkpaths[i].setMap(null);
    this.markers = new Array();
    this.walkpaths = new Array();
}

//-----------------------------------------------------------------------
// get the list of the path points
//-----------------------------------------------------------------------
function getPathList(groupName) {
    var dataString = '{groupName:"' + groupName + '"}';
    $.ajax({ // ajax call starts
        url: '../TreasureAjax.asmx/getPathList',   // server side method
        data: dataString,    // the parameters sent to the server
        type: 'POST',
        dataType: 'json', // Choosing a JSON datatype
        contentType: 'application/json; charset = utf-8',
        success: function (data) // Variable data contains the data we get from serverside
        {            
            var pathList = $.parseJSON(data.d);
            drawPath(pathList);
        }, // end of success
        error: function (e) {
            alert("failed in getDistance :( " + e.responseText);
        } // end of error
    }) // end of ajax call
}

//--------------------------------------------------------------------------------
// draw the path from the path list
//--------------------------------------------------------------------------------
function drawPath(pathList) {

    polyLineArr = new Array(); // create a new array
    // load all the path points to the array
    for (i = 0; i < pathList.length; i++) {
        polyLineArr[i] = new google.maps.LatLng(pathList[i].Lat, pathList[i].Lng);
    }

    var walkPath = new google.maps.Polyline({
        path: polyLineArr, // the name of the array
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    walkPath.setMap(map); // show the walk path on the map
    this.walkpaths.push(walkPath);
}

//Update the status base
function updateStatus(status) {
    var div = document.getElementById("status");
    div.innerHTML = status;
}




