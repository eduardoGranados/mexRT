angular.module('gmap', [])

    .directive('googleplace', function() {
        return {
            require: 'ngModel',
            link: function($scope, $element, $attrs, $model) {
                var options = {
                    types: ['geocode'],
                    componentRestrictions: {country: "ve"} //TODO change to US
                };
                $scope.gPlace = new google.maps.places.Autocomplete($element[0], options);

                google.maps.event.addListener($scope.gPlace, 'place_changed', function() {
                    $scope.$apply(function() {
                        $model.$setViewValue($element.val());
                    });
                });
            }
        };
    })
    //gmap directive
    .directive('mainMap', function(){
        return {
            restrict: 'E',
            templateUrl: "templates/map-template.html",
            controller: function($rootScope,$scope, $http) {


                var base = "http://groupmwt.com/garzablanca/DBOff/Angular/ajax/";
                $scope.geocoder = new google.maps.Geocoder();

                //update address function
                $scope.updateAddress = function(results){
                    var address = results.address_components[0].long_name+
                        " "+results.address_components[1].long_name+
                        " "+results.address_components[2].short_name;
                    $('#address-label').html(address);
                };

                $scope.init = function () {
                    navigator.geolocation.getCurrentPosition($scope.onSuccess, $scope.onError);
                };
                $scope.onSuccess = function (position) {

                    $scope.current_pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var mapOptions = {
//                        backgroundColor: '#aeb8bc',
                        disableDefaultUI: true,
                        zoomControl: false,
                        zoomControlOptions: {
                            style: google.maps.ZoomControlStyle.SMALL,
                            position: google.maps.ControlPosition.LEFT_CENTER
                        },
                        center: $scope.current_pos,
                        zoom: 18,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var styles = [
                        {
                            featureType: "poi",
                            stylers: [
                                { visibility: "off" }
                            ]
                        }
                    ];
                    var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});
                    $rootScope.map =new google.maps.Map(document.getElementById("geolocation"), mapOptions);

                    //set map styles
                    $rootScope.map.mapTypes.set('map_style', styledMap);
                    $rootScope.map.setMapTypeId('map_style');

                    //on map loaded event
                    var initEvent = google.maps.event.addListener($rootScope.map, 'tilesloaded', function(){
                        $('.ui-el').css({'display':'block'});
                        google.maps.event.removeListener(initEvent);

                        $scope.geocoder.geocode({'latLng': $rootScope.map.getCenter()}, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    $scope.updateAddress(results[0]);
                                }
                            }
                        });
                    });
                    //Drag map Event
                    var dragEvent = google.maps.event.addListener($rootScope.map, 'drag', function(){
                        $('#address-label').html('...');
                    });
                    //Dragend map Event
                    var dragEndEvent = google.maps.event.addListener($rootScope.map, 'dragend', function(){
                        $scope.geocoder.geocode({'latLng': $rootScope.map.getCenter()}, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    $scope.updateAddress(results[0]);
                                }
                            }
                        });
                    });
                    //Zoom control
                    $('#out-zoom').bind('touchstart',function(){
                        var actual_zoom=$rootScope.map.getZoom();
                        if(actual_zoom != 0){
                            $rootScope.map.setZoom(actual_zoom-1);
                        }
                    });
                    $('#in-zoom').bind('touchstart',function(){
                        var actual_zoom=$rootScope.map.getZoom();
                        if(actual_zoom != 20){
                            $rootScope.map.setZoom(actual_zoom+1);
                        }
                    });
                    //stop locating
                    $('#locating').bind('touchstart',function(){
                        $('#locating').css('display','none');
                        $('#not-locating').css('display','block');
                        navigator.geolocation.clearWatch($rootScope.watch_location);
                    });
                    //start locating
                    $('#not-locating').bind('touchstart',function(){
                        $('#locating').css('display','block');
                        $('#not-locating').css('display','none');
                        $rootScope.watch_location = navigator.geolocation.watchPosition( function(new_position){
                            coords = new google.maps.LatLng(new_position.coords.latitude, new_position.coords.longitude);
                            $rootScope.map.panTo(coords);
                            $scope.geocoder.geocode({'latLng': $rootScope.map.getCenter()}, function(results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[0]) {
                                        $scope.updateAddress(results[0]);
                                    }
                                }
                            });
                        },function(){
                            console.log('some geo-watch error');
                        },{
                            maximumAge : 300,
                            timeout : 3000,
                            enableHighAccuracy : true
                        });
                    });
                    //set hidden markers
                    $scope.userMarker= new google.maps.Marker({
                        map: $rootScope.map,
                        icon: 'img/person-pin.png'
                    });
                    $scope.taxiMarker= new google.maps.Marker({
                        map: $rootScope.map,
                        icon: 'img/taxi-pin.png'
                    });

                    //change taxi position routine
                    $scope.setCabPosition = function(){
                        $http.post(base+"getDriverGL.php?uid="+$rootScope.taxiID)
                            .success(function(data){
                                $scope.taxiMarker.setPosition(new google.maps.LatLng(data[0].latitude, data[0].longitude));
                            }).error(function(data){
                                console.log("error>"+data);
                            });
                    };

                    //Second Map: mark set, no address, taxi mark -> activated when taxi found
                    $rootScope.setSecondMap = function () {

                        $scope.userMarker.setMap($rootScope.map);
                        $scope.taxiMarker.setMap($rootScope.map);

                        $("#displaycab-btn").css('display','block');
                        $("#findcab-btn").css('display','none');
                        $("#header-buttons").css('display','none');
                        $("#address-container").css('display','none');
                        $(".locate-btn").css('display','none');
                        $("#user-marker").css('display','none');
                        $("#canvas-container").css({'top': '0px','height': '100%'});
                        $("#secondMap-setter").css('display','none');
                        $("#hidemodal-btn").css('display','block');

                        //set markers
                        $scope.userMarker.setPosition($rootScope.map.getCenter());
                        $scope.bounds = new google.maps.LatLngBounds();
                        $scope.bounds.extend($scope.userMarker.getPosition());
                        $http.post(base+"getDriverGL.php?uid="+$rootScope.taxiID)
                            .success(function(data){
                                $scope.taxiMarker.setPosition(new google.maps.LatLng(data[0].latitude, data[0].longitude));
                                $scope.bounds.extend($scope.taxiMarker.getPosition());
                                $rootScope.map.fitBounds($scope.bounds);
                            }).error(function(data){
                                console.log("error>"+data);
                            });

                        $rootScope.hideNewTask();
                        $rootScope.watchCab = setInterval(function(){
                            $scope.setCabPosition();
                        },5000);
                    };

                    $rootScope.setMainMap = function () {

                        $("#displaycab-btn").css('display','none');
                        $("#findcab-btn").css('display','block');
                        $("#header-buttons").css('display','block');
                        $("#address-container").css('display','block');
                        $("#not-locating").css('display','block');
                        $("#user-marker").css('display','block');
                        $("#canvas-container").css({'top': '10%','height': '83%'});
                        $("#secondMap-setter").css('display','block');
                        $("#hidemodal-btn").css('display','none');
                        $("#btn_logout").css('display','block');

                        $scope.taxiMarker.setMap(null);
                        $scope.userMarker.setMap(null);

                        clearInterval($rootScope.watchCab);
                    }
                };
                $scope.onError = function(){
                    console.log('some error');
                };
            }
        };
    });