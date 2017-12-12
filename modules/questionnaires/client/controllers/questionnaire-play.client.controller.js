'use strict';

// CertificateFactory controller
angular.module('questionnaires').controller('QuizPlayController', ['$scope', '$rootScope', '$stateParams', '$location', '$localstorage', '$window', 'Authentication', 'QuizFactory', 'QuestionnaireService', 'SweetAlert', 'FileUploader',
  function ($scope, $rootScope, $stateParams, $location, $localstorage, $window, Authentication, QuizFactory, QuestionnaireService, SweetAlert, FileUploader) {
    $scope.authentication = Authentication;
    $rootScope.mainTitle = 'Questionnaires';
    $scope.quizFinished = false;
    var answerStorageKey = 'answers', finishedStorageKey = 'finished', greenBackgroundClass = 'greenBackground', mainBackgroundClass = 'mainBackground';

    $scope.questionnaire = {};
    $scope.currentQuestion = 0;
    $scope.getByID = function () {
      var id = $stateParams.questionnaireId;
      var finishedObject = $localstorage.getObject(finishedStorageKey);
      if (finishedObject && finishedObject.questionnaire === id) {
        $scope.currentQuestion = finishedObject.answers.length;
      }
      angular.element('.' + mainBackgroundClass).addClass(greenBackgroundClass);

      QuestionnaireService.getByID(id)
        .then(function (response) {
          $scope.questionnaire = response.data;
          var answers = $localstorage.getObject(answerStorageKey);
          if (answers.length !== undefined) {
            $scope.currentQuestion = answers.length;
          }

          addLocationChangeListener();
          $scope.startTime = new Date();
        }, function (error) {
          console.log(error);
        });
    };

    var addLocationChangeListener = function() {
      $scope.$on('$locationChangeStart', function (event, next, current) {
        if (current) {
          var answer = confirm('Are you sure you want to exit questionnaire?');
          if (!answer) {
            event.preventDefault();
          }
        }
      });
    };

    var match_operator_up = {
      '+': function (x, y) {
        return x + y;
      },
      '-': function (x, y) {
        return x - y;
      },
      '++': function (x) {
        return ++x;
      },
      '--': function (x) {
        return --x;
      }
    };

    $scope.switchQuestion = function (operator) {
      if ($scope.quizFinished) {
        return;
      }

      var value = match_operator_up[operator]($scope.currentQuestion);
      $scope.currentQuestion = value;
      if (value >= $scope.questionnaire.questions.length) {
        $scope.finishQuiz();
        return;
      }
    };

    $scope.finishQuiz = function () {
      $scope.quizFinished = true;
      $scope.currentQuestion = $scope.questionnaire.questions.length;

      var data = {
        answers: $scope.answers,
        started: $scope.startTime,
        questionnaire: $scope.questionnaire.id
      };

      QuestionnaireService.finishPlay(data, $scope.questionnaire.id)
        .then(function (response) {
          console.log(response.data);
        });
    };

    $scope.answers = [];
    $scope.registerAnswer = function (index) {
      var question = $scope.questionnaire.questions[$scope.currentQuestion];
      var option = question.options[index];
      $scope.answers.push(option.id);
      $localstorage.setObject(answerStorageKey, $scope.answers);
      $scope.switchQuestion('++');
    };

    $scope.$on("$destroy", function () {
      angular.element('.' + mainBackgroundClass).removeClass(greenBackgroundClass);
    });

  }
]);
