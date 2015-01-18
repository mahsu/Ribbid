function RequestsController($scope, $http) {
  $scope.gps = false;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      $scope.gps = true;
      $http.get('/api/requests?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude).success(function(data, status, headers, config) {
        data = data.filter(function(el) {
          return !el.obj.fulfillerId;
        });
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
  $http.get('/api/me/requests_bids').success(function(data, status, headers, config) {
    console.log(data);
    try {
      $scope.unfulfilled_requests = data.requests.filter(function(el) {
        return el.fulfillerId == null;
      });
    } catch(e) {}
    try {
      $scope.fulfilled_requests = data.requests.filter(function(el) {
        return el.fulfillerId != null;
      });
    } catch(e) {}
    try {
      $scope.unaccepted_bids = data.bids.map(function(elem) {
        elem.bid = elem.bids.filter(function(e) {
          return !e.accepted
        }).reduce(function(a, b) {
          return a.price<b.price?a:b;
        });
        return elem;
      });
    } catch(e) {}
    try {
      $scope.accepted_bids = data.bids.map(function(elem) {
        elem.bid = elem.bids.filter(function(e) {
          return e.accepted
        }).reduce(function(a, b) {
          return a.price<b.price?a:b;
        });
        return elem;
      });
    } catch(e) {}
  });
}

function RequestController($scope, $http, $routeParams, $location) {
  $scope.making_bid = false;
  $scope.startBid = function() {
    setTimeout(function() {
      $('#bidAmnt').focus();
    }, 100);
    $scope.making_bid = true;
  }
  $scope.cancelBid = function() {
    $scope.making_bid = false;
  }

  $scope.makeBid = function() {
    if ($scope.bid && $scope.bid.match(/^\$?[0-9]*\.?[0-9]*$/)) {
      var bid = $scope.bid.replace(/[^0-9.]+/g, "");
      $http.post('/api/request/' + $routeParams.id + '/bids', {
        price: bid
      }).success(function() {
        $http.get('/api/request/' + $routeParams.id).success(function(data, status, headers, config) {
          data.bids = data.bids.sort(function(x, y) {
            return Date.parse(y.timestamp) - Date.parse(x.timestamp);
          });
          $scope.request = data;
        });
      });
    }
  }

  $scope.accepting = false;
  $scope.startAccept = function(id) {
    $('.list-item').removeClass('accepting');
    $('#'+id).addClass('accepting');
  }
  $scope.cancelAccept = function() {
    $('.list-item').removeClass('accepting');
  }
  $scope.makeAccept = function(id) {
    $http.patch('/api/request/' + $routeParams.id + '/bid/' + id + '/accept').success(function() {
      $location.path("/me/requests_bids");
    });
  }
  $scope.bounds = new google.maps.LatLngBounds();
  $scope.map;
  $http.get('/api/request/' + $routeParams.id).success(function(data, status, headers, config) {
    console.log(data)
    data.bids = data.bids.sort(function(x, y) {
      return Date.parse(y.timestamp) - Date.parse(x.timestamp);
    });
    $scope.request = data;
    $scope.drop_off = new google.maps.LatLng(data.loc.coordinates[1], data.loc.coordinates[0]);
    $scope.bounds.extend($scope.drop_off);
  });

  mapSetup = function(map) {
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
           marker = new google.maps.Marker({
            position: $scope.drop_off,
            map: map
          });
          map.fitBounds($scope.bounds);
          map.panToBounds($scope.bounds);
        }
      });
    }
  }

  $scope.$on('mapInitialized', function(event, map) {
    $scope.map = map;
    mapSetup(map);
  });
  $scope.$on('$viewContentLoaded', function() {
    try {
      mapSetup($scope.map);
    } catch(e) {}
  });

}