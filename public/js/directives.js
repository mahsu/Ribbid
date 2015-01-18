'use strict';

angular.module('ribbid.directives', [])
  .directive('fromnow', function() {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        attrs.$observe("date", function (date) {
          var diff = moment.duration(moment(date).diff(moment(Date.now())));
          var h = diff.get('hours');
          var m = diff.get('minutes');
          if (h > 0) {
            element.text(h + "h");
          } else {
            element.text(m + "m");
          }
        });
      }
    }
  })
  .directive('bidmin', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        attrs.$observe("bids", function (bids) {
          bids = JSON.parse(bids);
          var min = bids[0].price;
          for(var i = 1; i < bids.length; i++) {
            if (bids[i].price < min) {
              min = bids[i].price;
            }
          }
          element.text("$" + min.toFixed(2));
        });
      }
    }
  })
  .directive('bidfind', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        attrs.$observe("bids", function (bids) {
          bids = JSON.parse(bids);
          var bid = bids.filter(function(el){
            return el.accepted;
          })[0];
          element.text("$" + bid.price.toFixed(2));
        });
      }
    }
  })
  .directive('initialprice', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        attrs.$observe("obj", function (obj) {
          obj = JSON.parse(obj);
          if (obj.bids.length==0) {
            element.text("$" + obj.startingPrice.toFixed(2));
          } else {
            var min = obj.bids[0].price;
            for(var i = 1; i < obj.bids.length; i++) {
              if (obj.bids[i].price < min) {
                min = obj.bids[i].price;
              }
            }
            element.text("$" + min.toFixed(2));
          }
        });
      }
    }
  });