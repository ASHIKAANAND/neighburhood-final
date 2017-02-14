//model for locations
    var map;
    var markers = [];
    var flag=0;
    var rev =ko.observable(false);

    // model
        var locations=[
        {
        title:'nelliampathi',
        location:{lat:10.5354,lng:76.6936},
        id:'0'
    },

        {
            title:'vadakkunnathan Temple',
            location:{lat:10.5243,lng:76.2135},
            id:'1'
    },
    {
            title:'Parambikulam Wildlife Sanctuary',
            location:{lat:10.3929,lng:76.7756},
            id:'2'
    },
        {
            title:'Chimminy wild life',
            location:{lat:10.4310,lng: 76.4910},
            id:'3'
        },
         {
            title:'Peechi-Vazhani Wild life sanctuary',
            location:{lat:10.4834,lng: 76.4332},
            id:'4'
        },
        {
           title:'kozhikode beach',
            location:{lat:11.2626,lng: 75.7673},
            id:'5'
        },
        {
           title:'Athirapaly falls',
            location:{lat:10.2851,lng: 76.5698},
            id:'6'
        }
    ];

    function initMap(){
        var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d8' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];

        map = new google.maps.Map(document.getElementById('map'),{
            center:{lat:10.5276,lng:76.2144},
            zoom:10,
            styles:styles,
            mapTypeControl:false
        });

        var largeInfoWindow =new google.maps.InfoWindow();
         var defaultIcon = makeMarkerIcon('0091ff');
        var highlightedIcon = makeMarkerIcon('FFFF24');
         var highlightIcon = makeMarkerIcon('FF0000');


//display markers
        for(var i=0;i<locations.length;i++){
            var position = locations[i].location;
            var title = locations[i].title;
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,// to animate markers drop down
                icon: defaultIcon,
                id: i
            });

        markers.push(marker);
         locations[i].marker = marker;
         //when marker is clicked infowindow opens.
        marker.addListener('click',function(){
            var self=this;
            this.setIcon(highlightIcon);
            this.setAnimation(google.maps.Animation.BOUNCE);
             setTimeout(function() {
            self.setAnimation(google.maps.Animation.NULL);
        }, 700);

            populateInfoWindow(this,largeInfoWindow);
        });

      marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        //     this.setAnimation(google.maps.Animation.BOUNCE);
        //      setTimeout(function() {
        //     marker.setAnimation(null);
        // }, 1000);


          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
            this.setAnimation(google.maps.Animation.NULL);

          });
      }
}

        function populateInfoWindow(marker,infowindow){

        // Checking to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }


        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        //A streetview gets loaded for each marker upon a click
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
                alert("no streetview available!");
            }
        }

        //Wikipedia ajax request
        var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        $.ajax({
            url: wikiURL,
            dataType: "jsonp"
        }).done(function(response) {
 var articleStr = response[1];
            if (!articleStr) {
                alert("Wikipedia data is not available");
            }
            var URL = 'http://en.wikipedia.org/wiki/' + articleStr;
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.setContent('<div>' + marker.title + '</div><br><a href ="' + URL + '" target="_blank">' + URL + '</a><hr><div id="pano"></div>');
            // Open the infowindow on the correct marker
            infowindow.open(map, marker);

            // error handling
        }).fail(function(jqXHR, textStatus) {
            alert("failed to load wikipedia data!");
        });

};


     function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      }
            function hideListings() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }
            function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

    var error = function() {
        alert("google maps not available!");
}




//show all markers
function markervisible(){
     for(var i=0;i<markers.length;i++){
        markers[i].setVisible(true);
       }
    };

    //open options-box
opennav = function (){
    flag=flag+1;
    if(flag===1){
      rev(true);
      console.log(rev());
        }
    else if(flag===2){
    rev(false);
    flag=0;
      console.log(rev());
    }
}

//handle clicks on list items.
myClickEventHandler = function(currentItem) {
     var index = currentItem.id;
     var marker = markers[index];
     console.log(index);
     google.maps.event.trigger(marker, 'click');
}

var Location = function(data){
        this.title =ko.observable(data.title);
        this.location = ko.observable(data.location);
        this.marker = ko.observable(data.marker);
        this.id =ko.observable(data.id);
      };


//viewmodel
var ViewModel = function(){

    var self= this;
    self.filter = ko.observable('');

    this.placesArray = ko.observableArray();
     locations.forEach(function(locItem){
        self.placesArray.push(new Location(locItem));
    });

// function for filtering using knockout
     self.filteredItems = ko.computed(function() {
    var filter = this.filter().toLowerCase();// to convert to lowercase.

    if (!filter) {
        markervisible();//show all markers

         return self.placesArray();
        }// if filter() is empty return the list view.

     else {
        return ko.utils.arrayFilter(locations, function(item) {
                var visibleplaces = item.title.toLowerCase().indexOf(filter)!==-1;
                console.log(visibleplaces);
                 item.marker.setVisible(visibleplaces); // display the filtered markers
                return visibleplaces;
        });
    }

}, self);

     self.placesArray().forEach(function(myItem, index) {
    myItem.id = index;
    console.log(myItem.id);
});

};
ko.applyBindings(new ViewModel());






