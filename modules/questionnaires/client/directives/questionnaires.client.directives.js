'use strict';

angular
  .module('questionnaires')
  .directive('customQuestionnaireSubmit', ['$parse', function ($parse) {

    var checkIfNumberOfOptionsIsValid = function (scope, question) {
      var questionType = scope.questionTypes.find(questionType => questionType.type === question.type);
      // No entry in configuration for this type
      if (questionType === undefined || questionType.numOptions === undefined) {
        return {
          valid: true,
          error: null
        };
      }

      return {
        valid: questionType.numOptions === question.options.length,
        error: 'Please add correct number of options: ' + questionType.numOptions
      };
    };

    var checkIfNumberOfCorrectOptionsIsValid = function (scope, question) {
      var questionType = scope.questionTypes.find(questionType => questionType.type === question.type);
      // No entry in configuration for this type
      if (questionType === undefined || questionType.numCorrect === undefined) {
        return {
          valid: true,
          error: null
        };
      }

      var numIsCorrect = question.options.filter(option => option.isCorrect === true).length;
      return {
        valid: questionType.numCorrect === numIsCorrect,
        error: 'Please add correct number of correct options: ' + questionType.numCorrect
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      link: function (scope, element, attr, formCtrl) {
        var fn = $parse(attr.customQuestionnaireSubmit);

        element.bind('submit', function (event) {
          var questionHasAnswerIndexes = [];
          //Validate if every question has atleast one answer
          for (var i = 0; i < scope.questions.length; i++) {
            var numOptionsValid = checkIfNumberOfOptionsIsValid(scope, scope.questions[i]);
            if (scope.questions[i].options.length === 0) {
              formCtrl['qQuestion' + i].$invalid = true;
              formCtrl['qQuestion' + i].$valid = false;
              formCtrl['qQuestion' + i].$error.option = 'Please add at least one option per question';
            } else if (scope.questions[i].type === undefined || 
              scope.questions[i].type  === "") {
              formCtrl['qQuestion' + i].$invalid = true;
              formCtrl['qQuestion' + i].$valid = false;
              formCtrl['qQuestion' + i].$error.option = 'Please select question type';
            } else if (!numOptionsValid.valid) {
              formCtrl['qQuestion' + i].$invalid = true;
              formCtrl['qQuestion' + i].$valid = false;
              formCtrl['qQuestion' + i].$error.option = numOptionsValid.error;
            } else {
              questionHasAnswerIndexes.push(i);
            }
          }

          //If it has remove all errors from that question
          for (i = 0; i < questionHasAnswerIndexes.length; i++) {
            formCtrl['qQuestion' + questionHasAnswerIndexes[i]].$invalid = false;
            formCtrl['qQuestion' + questionHasAnswerIndexes[i]].$error = {};
          }

          //Trigger all other checks
          formCtrl.qName.$touched = true;
          formCtrl.qDescription.$touched = true;
          formCtrl.qDuration.$touched = true;

          if (questionHasAnswerIndexes.length !== scope.questions.length) {
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
