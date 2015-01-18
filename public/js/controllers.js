function RequestsController($scope, $http) {
  $scope.gps = false;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      $scope.gps = true;
      $http.get('/api/requests?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude)
      .success(function(data, status, headers, config) {
        console.log(data)
        $scope.requests = data;
      });
    });
  }

  $scope.request_form = {};
  $scope.submitRequest = function(isValid) {
    $scope.request_form.price = $scope.request_form.start_price.replace(/[^0-9.]+/g, "");
    $scope.request_form.tags = [];
    if ($scope.request_form.cat_tags) {
      $scope.request_form.tags = $scope.request_form.cat_tags.split(",");
    }
    geoCode($scope.request_form.loc, function(pos) {
      if (pos) {
        $scope.request_form.address = $scope.request_form.loc;
        $scope.request_form.location = {lat: pos.k, lon: pos.D}
        console.log($scope.request_form)
        $http.post('/api/requests', $scope.request_form)
        .success(function(data) {
          //$location.path('/me/requests');
        });
      }
    });

  };
}

function geoCode(address, callback) {
  geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      callback(results[0].geometry.location);
    } else {
      callback(false);
    }
  });
}

function UserController($scope, $http) {

}

function RequestController($scope, $http) {
  $scope.bounds = new google.maps.LatLngBounds();
  $scope.drop_off = new google.maps.LatLng(39.95, -75.16);
  $scope.bounds.extend($scope.drop_off);

  $scope.$on('mapInitialized', function(event, map) {
    map.setCenter($scope.drop_off);

    marker = new google.maps.Marker({
      position: $scope.drop_off,
      map: map
    });

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $scope.bounds.extend($scope.pos);

        if ($scope.pos) {
          me = new google.maps.Marker({
            position: $scope.pos,
            map: map
          });
          map.fitBounds($scope.bounds);
          map.panToBounds($scope.bounds);
        }
      });
    }
  });
}