'use strict';

angular.module('ribbid', ['ngRoute', 'ribbid.filters', 'ribbid.services', 'ribbid.directives'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/requests', {
        templateUrl: 'partials/requests',
        controller: RequestsController
      })
      .when('/create', {
        templateUrl: 'partials/create',
        controller: RequestsController
      })
<<<<<<< HEAD
      .when('/request', {
        templateUrl: 'partials/request',
        controller: RequestsController
=======
      .when('/login', {
        templateUrl: 'partials/login'
>>>>>>> FETCH_HEAD
      })
      .otherwise({
        redirectTo: '/requests'
      });
      $locationProvider.html5Mode(true);
  }]);