function RequestsController($scope, $http) {
  $scope.gps = false;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      $http.get('/api/requests?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude)
      .success(function(data, status, headers, config) {
        $scope.gps = true;
        $scope.requests = data.requests;
      });
    });
  }

  $scope.request_form = {};
  $scope.submitRequest = function(isValid) {
    $scope.request_form.price = $scope.request_form.start_price.replace(/[^0-9.]+/g, "");
    $scope.request_form.tags = $scope.request_form.cat_tags.split(",");
    geoCode($scope.request_form.loc, function(pos) {
      if (pos) {
        $scope.request_form.address = $scope.request_form.loc;
        $scope.request_form.location = {lat: pos.k, lon: pos.D}
        console.log($scope.request_form);
        $http.post('/api/requests', $scope.request_form)
        .success(function(data) {
          $location.path('/me/requests');
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