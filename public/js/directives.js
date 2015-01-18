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
  });