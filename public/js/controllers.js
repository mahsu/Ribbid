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
}