'use strict';

angular
  .module('questionnaires')
  .directive('questionnaireTimer', ['$timeout', '$parse', function ($timeout,  $parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        var callback = $parse(attr.questionnaireTimer);
        attr.$observe("timerMinutes", function() {
          //Did not bind questionnaire yet
          if(attr.timerMinutes === '') {
            return;
          }
          scope.timerHours = attr.timerHours;
          scope.timerMinutes = attr.timerMinutes;
          scope.timerSeconds = attr.timerSeconds;
          
          setTimer(scope);
          scope.timerCountDown = function() {
            scope.timerSeconds--;
            if(scope.timerSeconds < 0) {
              if(scope.timerMinutes === 0 && callback !== null) {
                callback();
              }
      
              scope.timerSeconds = 59;
              scope.timerMinutes--;
            }
            
            setTimer(scope);
            $timeout(scope.timerCountDown, 1000);
          };

          $timeout(scope.timerCountDown, 1000);
        });
        
      }
    };

    function setTimer(scope)
    {
      scope.timer =  (scope.timerMinutes < 10 ? "0" + scope.timerMinutes : scope.timerMinutes) + ":" + 
      (scope.timerSeconds < 10 ? "0" + scope.timerSeconds : scope.timerSeconds);
    }
  }]);
