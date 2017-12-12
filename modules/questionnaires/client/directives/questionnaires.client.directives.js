'use strict';

angular
  .module('questionnaires')
  .directive('customQuestionnaireSubmit', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      require: '^form',
      link: function (scope, element, attr, formCtrl) {
        var fn = $parse(attr.customQuestionnaireSubmit);

        element.bind('submit', function (event) {
          var questionHasAnswerIndexes = [];
          //Validate if every question has atleast one answer
          for (var i = 0; i < scope.questions.length; i++) {
            if (scope.questions[i].options.length === 0) {
              formCtrl['qQuestion' + i].$invalid = true;
              formCtrl['qQuestion' + i].$valid = false;
              formCtrl['qQuestion' + i].$error.option = 'Please add atlease one answer per question';
            }else {
              questionHasAnswerIndexes.push(i);
            }
          }

          //If it has remove all errors from that question
          for(i = 0;i < questionHasAnswerIndexes.length;i++) {
            formCtrl['qQuestion' + questionHasAnswerIndexes[i]].$invalid = false;
            formCtrl['qQuestion' + questionHasAnswerIndexes[i]].$error = {};
          }

          //Trigger all other checks
          formCtrl.qName.$touched = true;
          formCtrl.qDescription.$touched = true;
          formCtrl.qDuration.$touched = true;

          if(questionHasAnswerIndexes.length !== scope.questions.length) {
            scope.$apply();
            return false;
          }

          // if form is not valid cancel it.
          if (!formCtrl.$valid) {
            scope.$apply();
            return false;
          }

          scope.$apply(function () {
            fn(scope, {
              $event: event
            });
          });
        });

      }
    };
  }]);
