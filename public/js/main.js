'use strict';

angular.module('ribbid', ['ngMap', 'angularMoment', 'ngAnimate', 'ngRoute', 'ribbid.filters', 'ribbid.services', 'ribbid.directives'])
  .factory('httpResponseInterceptor',['$q','$location',function($q,$location){
    return {
        response: function(response){
            console.log(response.status, response.body)
            if (response.status === 401) {
                console.log("Response 401");
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            console.log(rejection.status, rejection.body)
            if (rejection.status === 401) {
              window.location = "/";
                //$location.path('/').search('returnTo', $location.path());
            }
            return $q.reject(rejection);
        }
    }
  }])
  .config(['$httpProvider', '$routeProvider', '$locationProvider', function($httpProvider, $routeProvider, $locationProvider) {
    $httpProvider.interceptors.push('httpResponseInterceptor');
    $routeProvider
      .when('/requests', {
        templateUrl: 'partials/requests',
        controller: RequestsController
      })
      .when('/create', {
        templateUrl: 'partials/create',
        controller: RequestsController
      })
      .when('/request/:id', {
        templateUrl: 'partials/request',
        controller: RequestController
      })
      .when('/request/:id/pay', {
        templateUrl: 'partials/pay',
        controller: RequestController
      })
      .when('/me/requests_bids', {
        templateUrl: 'partials/requests_bids',
        controller: UserController
      })
      .when('/me/request/:id', {
        templateUrl: 'partials/request_view',
        controller: RequestController
      })
      .when('/me', {
        templateUrl: 'partials/user'
        //controller: UsersController
      })
      .when('/login', {
        templateUrl: 'partials/login'
      })
      .otherwise({
        redirectTo: '/requests'
      });
    $locationProvider.html5Mode(true);
  }]);