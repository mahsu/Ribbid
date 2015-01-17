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
  $scope.submitRequest = function () {
    $scope.request_form.tags = $scope.request_form.tags.split(",");
    console.log($scope.request_form);
    $http.post('/api/requests', $scope.request_form)
      .success(function(data) {
        $location.path('/me/requests');
      });
  };
}