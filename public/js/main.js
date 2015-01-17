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
      .otherwise({
        redirectTo: '/requests'
      });
      $locationProvider.html5Mode(true);
  }]);